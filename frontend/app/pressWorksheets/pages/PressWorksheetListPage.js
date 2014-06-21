// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../PressWorksheetCollection',
  '../views/PressWorksheetFilterView',
  '../views/PressWorksheetListView',
  'app/core/templates/listPage'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  PressWorksheetCollection,
  PressWorksheetFilterView,
  PressWorksheetListView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'pressWorksheetList',

    breadcrumbs: [
      t.bound('pressWorksheets', 'BREADCRUMBS:browse')
    ],

    actions: function()
    {
      return [
        pageActions.jump(this, this.pressWorksheetList),
        pageActions.add(this.pressWorksheetList)
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    defineModels: function()
    {
      this.pressWorksheetList = bindLoadingMessage(
        new PressWorksheetCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new PressWorksheetFilterView({
        model: {
          rqlQuery: this.pressWorksheetList.rqlQuery
        }
      });

      this.listView = new PressWorksheetListView({collection: this.pressWorksheetList});

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.pressWorksheetList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.pressWorksheetList.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.pressWorksheetList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
