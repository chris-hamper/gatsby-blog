// @flow strict
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Post from '../components/Post';
import { useSiteMetadata } from '../hooks';
import type { MarkdownRemark } from '../types';
import { liveRemarkForm } from 'gatsby-tinacms-remark';

type Props = {
  data: {
    markdownRemark: MarkdownRemark
  },
  isEditing: Boolean,
  setIsEditing: Function,
};

const PostTemplate = ({ data, isEditing, setIsEditing }: Props) => {
  const { title: siteTitle, subtitle: siteSubtitle } = useSiteMetadata();
  const { frontmatter } = data.markdownRemark;
  const { title: postTitle, description: postDescription, socialImage } = frontmatter;
  const metaDescription = postDescription !== null ? postDescription : siteSubtitle;

  return (
    <Layout title={`${postTitle} - ${siteTitle}`} description={metaDescription} socialImage={socialImage} >
      <button onClick={() => setIsEditing(p => !p)}>{isEditing ? 'Preview' : 'Edit'}</button>
      <Post post={data.markdownRemark} />
    </Layout>
  );
};

export const query = graphql`
  query PostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        slug
        tagSlugs
      }
      frontmatter {
        date
        description
        tags
        title
        socialImage
      }
      ...TinaRemark
    }
  }
`;

let postForm = {
  fields: [
    {name: "rawFrontmatter.title", label: "Title", component: "text"},
    {name: "rawFrontmatter.date", label: "Published Date", component: "date"},
    {name: "rawFrontmatter.draft", label: "Draft", component: "toggle"},
    {name: "rawFrontmatter.slug", label: "Slug", component: "text"},
    {name: "rawFrontmatter.category", label: "Category", component: "text"},
    {name: "rawFrontmatter.tags", label: "Tags", component: "text"},
    {name: "rawFrontmatter.description", label: "Synopsis", component: "textarea"},
    {name: "rawFrontmatter.socialImage", label: "Social Image", component: "text"},
    {name: "rawMarkdownBody", label: "Body", component: "markdown"},
  ],
}

export default liveRemarkForm(PostTemplate);
