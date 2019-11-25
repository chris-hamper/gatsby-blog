// @flow strict
import React from 'react';
import styles from './Content.module.scss';
import { Wysiwyg } from '@tinacms/fields';
import { TinaField } from '@tinacms/form-builder';
import { MyContentEditable } from '../../MyContentEditable';

type Props = {
  body: string,
  title: string,
  isEditing: Boolean,
};

const Content = ({ body, title, isEditing }: Props) => (
  <div className={styles['content']}>
    <h1 className={styles['content__title']}>
      <TinaField name="rawFrontmatter.title" Component={MyContentEditable}>
        {title}
      </TinaField>
    </h1>
    <TinaField name="rawMarkdownBody" Component={Wysiwyg}>
      <div className={styles['content__body']} dangerouslySetInnerHTML={{ __html: body }} />
    </TinaField>
  </div>
);

export default Content;
