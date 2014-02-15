define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../ProdShiftOrderCollection',
  '../views/ProdShiftOrderListView',
  '../views/ProdShiftOrderFilterView',
  'app/prodShiftOrders/templates/listPage'
], function(
  $,
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

    actions: function()
    {
      return [{
        label: t.bound('prodShiftOrders', 'PAGE_ACTION:export'),
        icon: 'download',
        href: '/prodShiftOrders;export?' + this.prodShiftOrderList.rqlQuery,
        privileges: 'PROD_DATA:VIEW'
      }];
    },

    initialize: function()
    {
      this.layout = null;

      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.prodShiftOrders-list-container', this.listView);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
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

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.prodShiftOrderList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });

      if (this.layout && this.layout.setActions)
      {
        this.layout.setActions(this.actions, this);
      }
    }

  });
});
