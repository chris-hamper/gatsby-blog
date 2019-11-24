'use strict';

require("prismjs/plugins/line-numbers/prism-line-numbers.css");
require("prismjs/plugins/command-line/prism-command-line.css")
require('./src/assets/scss/init.scss');
require('./static/css/prismjs/theme.min.css');

require("prismjs/themes/prism-tomorrow.css");

require('./src/assets/scss/tweaks.scss');

import { cms } from 'gatsby-plugin-tinacms'
import { UrlField } from './src/components/UrlField'

// Register custom TinaCMS field plugins
export const onClientEntry = () => {
  cms.fields.add({
    name: 'url',
    Component: UrlField,
  })
}
