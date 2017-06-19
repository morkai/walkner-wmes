// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../ProdShiftOrderCollection',
  '../views/ProdShiftOrderListView',
  '../views/ProdShiftOrderFilterView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  ProdShiftOrderCollection,
  ProdShiftOrderListView,
  ProdShiftOrderFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'prodShiftOrderList',

    breadcrumbs: [
      t.bound('prodShiftOrders', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      return [pageActions.export(layout, this, this.prodShiftOrderList)];
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
      this.prodShiftOrderList = bindLoadingMessage(
        new ProdShiftOrderCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ProdShiftOrderListView({collection: this.prodShiftOrderList});

      this.filterView = new ProdShiftOrderFilterView({
        model: {
          rqlQuery: this.prodShiftOrderList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.prodShiftOrderList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.prodShiftOrderList.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.prodShiftOrderList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
