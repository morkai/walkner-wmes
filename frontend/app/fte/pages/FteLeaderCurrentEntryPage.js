define([
  'app/i18n',
  'app/core/View',
  '../views/FteLeaderCurrentEntryView',
  'i18n!app/nls/fte'
], function(
  t,
  View,
  FteLeaderCurrentEntryView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteLeaderCurrentEntry',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:leader:entryList'),
        href: '#fte/leader'
      },
      t.bound('fte', 'BREADCRUMBS:leader:currentEntry')
    ],

    initialize: function()
    {
      this.view = new FteLeaderCurrentEntryView();
    }

  });
});
