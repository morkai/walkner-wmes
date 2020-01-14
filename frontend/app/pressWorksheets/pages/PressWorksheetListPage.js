// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    pageId: 'collection',

    breadcrumbs: [
      t.bound('pressWorksheets', 'BREADCRUMB:browse')
    ],

    actions: function(layout)
    {
      return [
        pageActions.jump(this, this.collection),
        pageActions.export(layout, this, this.collection),
        pageActions.add(this.collection)
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
      this.collection = bindLoadingMessage(
        new PressWorksheetCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new PressWorksheetFilterView({model: this.collection});

      this.listView = new PressWorksheetListView({collection: this.collection});

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
