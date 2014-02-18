define([
  'app/i18n',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteCurrentEntryView'
], function(
  t,
  View,
  FteMasterEntry,
  FteCurrentEntryView
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
      this.view = new FteCurrentEntryView({
        model: new FteMasterEntry({_id: 'current'}),
        divisionFilter: function(division)
        {
          return division.get('type') === 'prod';
        }
      });
    }

  });
});
