// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  '../FteWhEntry',
  '../views/FteEntryAddFormView'
], function(
  t,
  View,
  FteWhEntry,
  FteEntryAddFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteLeaderEntryAddForm',

    pageClassName: 'page-max-flex',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('fte', 'BREADCRUMB:' + this.model.TYPE + ':browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('fte', 'BREADCRUMB:addForm')
      ];
    },

    initialize: function()
    {
      var page = this;

      page.view = new FteEntryAddFormView({
        model: page.model,
        divisionFilter: function(division)
        {
          if (!division || !division.isActive())
          {
            return false;
          }

          if (page.model.TYPE === 'wh')
          {
            return division.id === FteWhEntry.WH_DIVISION;
          }

          return division.get('type') !== 'prod' && division.id !== FteWhEntry.WH_DIVISION;
        }
      });

      page.listenTo(page.view, 'editable', function(fteLeaderEntry)
      {
        page.broker.publish('router.navigate', {
          url: fteLeaderEntry.genClientUrl('edit'),
          trigger: true
        });
      });

      page.listenTo(page.view, 'uneditable', function(fteLeaderEntry)
      {
        page.broker.publish('router.navigate', {
          url: fteLeaderEntry.genClientUrl(),
          trigger: true
        });
      });
    }

  });
});
