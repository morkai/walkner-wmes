// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../ProdShiftCollection',
  '../views/ProdShiftListView',
  '../views/ProdShiftFilterView',
  'app/core/templates/listPage'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  ProdShiftCollection,
  ProdShiftListView,
  ProdShiftFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'prodShiftList',

    breadcrumbs: [
      t.bound('prodShifts', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.prodShiftList),
        pageActions.add(this.prodShiftList, 'PROD_DATA:MANAGE')
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
      this.prodShiftList = bindLoadingMessage(
        new ProdShiftCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ProdShiftListView({collection: this.prodShiftList});

      this.filterView = new ProdShiftFilterView({
        model: {
          rqlQuery: this.prodShiftList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.prodShiftList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.prodShiftList.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.prodShiftList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
