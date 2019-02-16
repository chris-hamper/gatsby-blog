import React from 'react';
import styles from './Copyright.module.scss';

const Copyright = ({ copyright, license }) => (
  <div className={styles['copyright']}>
    {copyright}<br/>
    {license.name}
    <a href={license.url}>
      <img src={license.badgeUrl} alt={license.name}/>
    </a>
  </div>
);

export default Copyright;