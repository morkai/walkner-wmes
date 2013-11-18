define([
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../EmptyOrderCollection',
  '../views/EmptyOrderListView',
  '../views/EmptyOrderFilterView',
  'app/emptyOrders/templates/listPage',
  'i18n!app/nls/emptyOrders'
], function(
  $,
  t,
  bindLoadingMessage,
  pageActions,
  View,
  EmptyOrderCollection,
  EmptyOrderListView,
  EmptyOrderFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'emptyOrderList',

    breadcrumbs: [
      t.bound('emptyOrders', 'BREADCRUMBS:browse')
    ],

    actions: [
      {
        className: 'emptyOrders-pageAction-print',
        label: t.bound('emptyOrders', 'PAGE_ACTION:print'),
        icon: 'print',
        href: '#emptyOrders;print',
        privileges: 'ORDERS:VIEW'
      }
    ],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.emptyOrders-list-container', this.listView);
      this.setView('.filter-container', this.filterView);
    },

    destroy: function()
    {
      this.layout = null;
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new EmptyOrderCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new EmptyOrderFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        }
      });

      this.listView = new EmptyOrderListView({collection: this.collection});

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      var newRqlQueryStr = newRqlQuery.toString();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQueryStr,
        trigger: false,
        replace: true
      });

      if (this.layout)
      {
        this.actions[0].href = '#emptyOrders;print?' + newRqlQueryStr;

        this.layout.setActions(this.actions, this);
      }
    }

  });
});
