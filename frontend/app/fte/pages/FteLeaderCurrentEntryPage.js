define([
  'app/i18n',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteCurrentEntryView'
], function(
  t,
  View,
  FteLeaderEntry,
  FteCurrentEntryView
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
      this.view = new FteCurrentEntryView({
        model: new FteLeaderEntry({_id: 'current'})
      });
    }

  });
});
