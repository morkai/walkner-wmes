// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteEntryAddFormView'
], function(
  t,
  View,
  FteLeaderEntry,
  FteEntryAddFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteLeaderEntryAddForm',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:leader:browse'),
        href: '#fte/leader'
      },
      t.bound('fte', 'BREADCRUMBS:addForm')
    ],

    initialize: function()
    {
      this.view = new FteEntryAddFormView({
        model: new FteLeaderEntry(),
        divisionFilter: function(division)
        {
          return division && division.get('type') !== 'prod' && division.isActive();
        }
      });

      this.listenTo(this.view, 'editable', function(fteLeaderEntry)
      {
        this.broker.publish('router.navigate', {
          url: fteLeaderEntry.genClientUrl('edit'),
          trigger: true
        });
      });

      this.listenTo(this.view, 'uneditable', function(fteLeaderEntry)
      {
        this.broker.publish('router.navigate', {
          url: fteLeaderEntry.genClientUrl(),
          trigger: true
        });
      });
    }

  });
});
