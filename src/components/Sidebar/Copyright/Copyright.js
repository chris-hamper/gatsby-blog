// @flow strict
import React from 'react';
import styles from './Copyright.module.scss';

type Props = {
  copyright: string
};

const Copyright = ({ copyright }) => (
  <div className={styles['copyright']}>
    {copyright} {new Date().getFullYear()}<br/>
    Licensed under CC BY-SA 4.0
    <a href="https://creativecommons.org/licenses/by-sa/4.0/">
      <img src="https://licensebuttons.net/l/by-sa/4.0/88x31.png" alt="Licensed under CC BY-SA 4.0"/>
    </a>
  </div>
);

export default Copyright;
