// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../MechOrderCollection',
  '../views/MechOrderListView',
  '../views/MechOrderFilterView',
  '../views/MechOrderImportView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  bindLoadingMessage,
  View,
  MechOrderCollection,
  MechOrderListView,
  MechOrderFilterView,
  MechOrderImportView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'mechOrderList',

    breadcrumbs: [
      t.bound('mechOrders', 'BREADCRUMBS:browse')
    ],

    actions: [{
      label: t.bound('mechOrders', 'PAGE_ACTION:import'),
      icon: 'refresh',
      privileges: 'ORDERS:MANAGE',
      callback: function()
      {
        viewport.showDialog(new MechOrderImportView(), t('mechOrders', 'import:title'));

        return false;
      }
    }],

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
        new MechOrderCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new MechOrderFilterView({
        model: this.collection
      });

      this.listView = new MechOrderListView({collection: this.collection});

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
