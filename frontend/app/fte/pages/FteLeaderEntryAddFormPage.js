// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
          return division && division.get('type') === 'dist';
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
