define([
  'app/i18n',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteEntryAddFormView'
], function(
  t,
  View,
  FteMasterEntry,
  FteEntryAddFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteMasterEntryAddForm',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:master:browse'),
        href: '#fte/master'
      },
      t.bound('fte', 'BREADCRUMBS:addForm')
    ],

    initialize: function()
    {
      this.view = new FteEntryAddFormView({
        model: new FteMasterEntry(),
        divisionFilter: function(division)
        {
          return division && division.get('type') === 'prod';
        }
      });

      this.listenTo(this.view, 'editable', function(fteMasterEntry)
      {
        this.broker.publish('router.navigate', {
          url: fteMasterEntry.genClientUrl('edit'),
          trigger: true
        });
      });

      this.listenTo(this.view, 'uneditable', function(fteMasterEntry)
      {
        this.broker.publish('router.navigate', {
          url: fteMasterEntry.genClientUrl(),
          trigger: true
        });
      });
    }

  });
});
