// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../EmptyOrderCollection',
  '../views/EmptyOrderListView',
  '../views/EmptyOrderFilterView',
  'app/core/templates/listPage'
], function(
  t,
  bindLoadingMessage,
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

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
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

      this.listView.refreshCollectionNow();

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
