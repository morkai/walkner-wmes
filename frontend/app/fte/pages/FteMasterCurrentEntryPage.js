define([
  'app/i18n',
  'app/core/View',
  '../views/FteMasterCurrentEntryView',
  'i18n!app/nls/fte'
], function(
  t,
  View,
  FteMasterCurrentEntryView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteMasterCurrentEntry',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:master:entryList'),
        href: '#fte/master'
      },
      t.bound('fte', 'BREADCRUMBS:master:currentEntry')
    ],

    initialize: function()
    {
      this.view = new FteMasterCurrentEntryView();
    }

  });
});
