// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../MechOrderCollection',
  '../views/MechOrderListView',
  '../views/MechOrderFilterView',
  '../views/MechOrderImportView',
  'app/mechOrders/templates/listPage'
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
      this.setView('.mechOrders-list-container', this.listView);
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
        model: {
          rqlQuery: this.collection.rqlQuery
        }
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
