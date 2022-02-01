//This script configures require js and bootstraps the application

//require.js will be concatenated with this file
//using the Makefile so that the resulting boot.js
//is the only JS file required to bootstrap the app.
//all modules defined by the core application are explictly set to empty:
//this will keep require.js from complaining about them...

require.config({
  paths: {
      jquery: 'empty:',
      react: 'empty:',
      moment: 'empty:',
      'api/project' : 'empty:',
      'api/user' : 'empty:',
      'utils' : 'empty:',
      'routing' : 'empty:',
      'settings' : 'empty:',
      'components/mixins/form' : 'empty:',
      'components/mixins/loader' : 'empty:',
      'components/mixins/tabs' : 'empty:',
      'components/generic/paginator' : 'empty:',
      'components/generic/offset_paginator' : 'empty:',
      'components/generic/sidebar' : 'empty:',
      'components/generic/filter' : 'empty:',
      'components/generic/modal' : 'empty:',
      'components/generic/helper' : 'empty:',
      'components/generic/icon' : 'empty:',
      'components/generic/toolbar' : 'empty:',
      'components/generic/query_info' : 'empty:',
      'components/generic/orderby_box' : 'empty:',
      'components/generic/toggle_switch' : 'empty:',
      'subject' : 'empty:',
      'flash_messages' : 'empty:'
  }
});
