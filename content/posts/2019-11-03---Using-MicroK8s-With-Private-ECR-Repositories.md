---
title: Using MicroK8s With Private ECR Repositories
date: "2019-11-03T21:48:00.000Z"
template: "post"
draft: false
slug: "/posts/using-microk8s-private-ecr-repositories/"
category: "Kubernetes"
tags:
  - "Kubernetes"
  - "MicroK8s"
description: "Wouldn't it be so convenient if MicroK8s always had pull access to all your
private Docker image repositories automagically? Well, it's surprisingly simple.
Here's how to make that happen!"
socialImage: "/media/kubernetes-horizontal-color.png"
---
MicroK8s is a great tool for working with Kubernetes on your local Linux environment.
Being built on Snap, it's easy to set up and manage, and very performant. I've found it to have fewer
bumps and surprises than other options like [kind](https://kind.sigs.k8s.io/)
(clusters occasionally just mysteriously stop running?!? 😠 I changed networks and now DNS broke completely?!? 🤬) or
[Docker on Mac with Kubernetes](https://www.docker.com/blog/docker-mac-kubernetes/)
(which is *pretty* nice if you need to use a Mac, but is harder to dig
into the guts of).

One sticky point of using any local Kubernetes setup is getting it to pull your
private Docker images. If you're using an EKS cluster on AWS, it's pretty easy to get it
talking with your private Elastic Container Registry (ECR) with just a bit of IAM role tweaking.

On a local machine, you need to fetch fresh ECR access tokens every few hours to do any
sort of pushing or pulling of images. Add a local K8s cluster into the mix and
there are even more steps, as you either need
to somehow inject those new ECR creds into your K8s Nodes kubelet configuration, or add
them to the cluster as a K8s Secret. On top of that, you need to *change* the Pod
specs you run on Kubernetes to tell them to use that Secret for pull credentials.

I don't know about you, but I prefer as much as possible to avoid making my
local dev cluster behave differently than
one I'd be using in Production. It avoids a lot of annoyances and "oops!" moments.

Wouldn't it be so convenient if MicroK8s had access to all your private Docker image
repositories automagically? Well, it's surprisingly simple. Here's how to
make that happen!

> **Note:** while this article focuses on ECR and Docker Hub, it should apply
to any private registry that integrates with `docker login`, including
Google Container Registry, Azure Container Registry, and even self-hosted Docker registries.

## Syncing All Your Docker Creds to MicroK8s

First off, I'm assuming you've [installed MicroK8s](https://microk8s.io/docs/),
and it's up and running. For now, let's stop MicroK8s:

```bash{outputLines: 2-3}
microk8s.stop

Stopped.
```

Make sure you have Docker configured to store your credentials in plaintext. Yes,
I know this isn't ideal, but there are fairly simple ways of securing these credentials
at rest, such as encrypting your home directory. And face it, if someone has access
to your home directory, they can just grab your AWS API tokens from there, anyway, right?

To do this, ensure that your Docker config at `~/.docker/config.json` has no
credential helper set by looking for a section with the key `credsStore`, such as:

```json
{
  "credsStore": "secretservice"
}
```

If you **don't** see this key anywhere, great! You're all set. If you do have it set, blank out the value:

```json
{
  "credsStore": ""
}
```

You'll need to log back in to get your credentials refreshed and stored as plaintext
in `~/.docker/config.json`:

```bash{outputLines: 2-9,11-15}
docker login

Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: <your-username>
Password:
WARNING! Your password will be stored unencrypted...

Login Succeeded

$(aws ecr get-login --no-include-email)
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted...

Login Succeeded
```

Believe it or not, that was probably the hardest part! Now all we need to do is inject
this Docker configuration into our MicroK8s Node's kubelet config directory, which can
be done with a simple symlink thanks to Snap!

```bash{outputLines: 2}
sudo ln -s ~/.docker/config.json \
  /var/snap/microk8s/common/var/lib/kubelet/
```

This will keep the credentials in sync even after you refresh them with the
aws-cli. Pods running on MicroK8s will have access to all the same private repos
as you have elsewhere on your local machine. Nice!

You should now be able to restart MicroK8s and fire up a Pod that uses a private registry:

```bash{outputLines: 2-6,9-12,14-16}
microk8s.start

Started.
Enabling pod scheduling
node/localhost already uncordoned

kubectx microk8s
kubectl run hello --generator=run-pod/v1 \
  --image=<your-aws-account>.dkr.ecr.<aws-region>.amazonaws.com/hello-world

pod/hello created

kubectl get pod hello

NAME    READY   STATUS    RESTARTS   AGE
hello   1/1     Running   0          5s
```

## Extra Credit: Keep Your ECR Token Fresh

Okay, that's already much better, but what if we want to be really lazy... errr... *efficient* and never need to run `$(aws ecr get-login)` again? Since the ECR token still needs to be refeshed every few hours, let's try cron. 

First we'll create a short shell script at `~/.local/bin/ecr-login.sh`:

```bash
#!/bin/sh
$(/usr/local/bin/aws ecr get-login --no-include-email)
```

Remember to make it executable:

```bash{outputLines: 2}
chmod +x ~/.local/bin/ecr-login.sh
```

Next, edit your user crontab:

```bash{outputLines: 2}
crontab -e
```

and append a new cron entry to call that script:

```text
0 */4 * * * /home/[YOUR_USERNAME]/.local/bin/ecr-login.sh 2>&1 >/tmp/ecr-login.log
```

This will run our login script every four hours at the top of the hour (based on the `0 */4` at the start of the line). Cool, that'll save some typing! But what about when we put our local machine to sleep? Unfortunately cron doesn't run in the interim, so our token will likely expire by the time we wake our computer up in the morning 😞 Are we doomed to refresh our token once every day for the rest of our lives?

Thankfully no. Ubuntu, and most other variants of Linux that use systemd will run commands in response to sleep/wake events, which you can find at `/lib/systemd/system-sleep/`. (Some other Linux distros instead use a framework called [pm-utils](https://pm-utils.freedesktop.org/wiki/) that has a directory for similar scripts, with slight differences.) **Note that you should be cautious working with the commands in this directory, as a mis-written script placed here just might prevent your system from waking!** If that happens, you'll need to perform a hard power cycle to circumnavigate the wake event, or worst case a system recovery to remove the offending script and get your machine working again.

We'll need to tweak our login script a bit, because `systemd` passes in the type of event as parameters, and we only need to trigger on `post` sleep events:

```bash
#!/bin/sh

case $1 in
  post)
    /usr/bin/sudo -iu [YOUR_USERNAME] bash -c '$(aws ecr get-login --no-include-email)' >> /tmp/ecr-login.log
    ;;
esac
```

Move the script into the `system-sleep` directory, changing its ownership to `root`:

```bash{outputLines: 3}
sudo chown root:root ~/.local/bin/ecr-login.sh
sudo mv ~/.local/bin/ecr-login.sh /usr/lib/pm-utils/sleep.d/ecr-login.sh
```

And that should do it! Every time your computer wakes from sleep or hibernation, your ECR token will automatically get refreshed. Now all you need to do is figure out what you'll do with all those extra seconds you're saving.

Enjoy!
