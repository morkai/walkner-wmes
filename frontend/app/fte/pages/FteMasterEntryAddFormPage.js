// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    pageClassName: 'page-max-flex',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMB:master:browse'),
        href: '#fte/master'
      },
      t.bound('fte', 'BREADCRUMB:addForm')
    ],

    initialize: function()
    {
      this.view = new FteEntryAddFormView({
        model: this.model || new FteMasterEntry(),
        divisionFilter: function(division)
        {
          return division && division.get('type') === 'prod' && division.isActive();
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
