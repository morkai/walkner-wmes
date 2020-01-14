// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../IcpoResultCollection',
  '../views/IcpoResultListView',
  '../views/IcpoResultFilterView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  IcpoResultCollection,
  IcpoResultListView,
  IcpoResultFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    breadcrumbs: [
      t.bound('icpo', 'BREADCRUMB:browse')
    ],

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection)
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
        new IcpoResultCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new IcpoResultListView({collection: this.collection});

      this.filterView = new IcpoResultFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        },
        collection: this.collection
      });

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
