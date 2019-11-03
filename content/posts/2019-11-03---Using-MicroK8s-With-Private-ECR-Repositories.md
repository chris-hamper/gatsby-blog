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
description: "Configuring a MicroK8s install to (almost) automatically
connect with a private ECR repository for pulling images."
---
MicroK8s is a great tool for working with Kubernetes on your local environment.
Being built on Snap, it's easy to set up and manage, and very performant. I've found it to have fewer
bumps and surprises than other options like [kind](https://kind.sigs.k8s.io/)
(clusters occasionally just mysteriously stop running!?!) or
[Docker on Mac with Kubernetes](https://www.docker.com/blog/docker-mac-kubernetes/)
(which is pretty nice if you need to use a Mac, but is harder to dig
into the guts of).

One tricky point of using any local Kubernetes setup is getting it to pull your
private Docker images. If you're using an EKS cluster, it's pretty easy to get it
talking with your ECR repository with just a bit of IAM role tweaking. On a local
machine, though, you need to fetch ECR access tokens every few hours to do any
sort of pushing or pulling of images.

Add a local K8s cluster into the mix and there are even more steps, as you either need
to inject those new ECR creds into your K8s Nodes kubelet configuration, or add
them to the cluster as a K8s Secret. On top of that, you need to change your Pod
specs to tell them to use that Secret for pull credentials. I don't know about
you, but I prefer to avoid making my local dev cluster behave differently than
one I'd be using in Production. It avoids a lot of annoyances and "oops!" moments.

Wouldn't it be so convenient if MicroK8s had access to all your private Docker image
repositories automagically? Well, it's surprisingly simple. Here's how to
make that happen!

Note that this article focuses specifically on ECR and Docker Hub, but can apply
to any other private repo that can store cred

First off, I'm assuming you've [installed MicroK8s](https://microk8s.io/docs/),
and it's up and running. For now, let's stop Microk8s:

```bash{outputLines: 2-3}
microk8s.stop

Stopped.
```

Make sure you have Docker configured to store your credentials in plaintext. Yes,
I know this isn't ideal, but there are fairly simple ways of securing these credentials
at rest, such as encrypting your home directory. And face it, if someone has access
to your home directory, they can just grab your AWS creds from there, anyway, right?

To do this, ensure that your Docker config at `~/.docker/config.json` has no
credential helper set by looking for a section with the key `credsStore`, such as:

```json
{
  "credsStore": "secretservice"
}
```

If you **don't** see this, great! You're all set. If you do have it set, blank out the value:

```json
{
  "credsStore": ""
}
```

You'll then need to log back in to get your credentials refreshed and stored as plaintext
in `~/.docker/config.json`:

```bash{outputLines: 3-11,13-18}
docker login

Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: <your-username>
Password: 
WARNING! Your password will be stored unencrypted in /home/chris/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded

$(aws ecr get-login --region us-east-1 --no-include-email)
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted in /home/chris/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```
