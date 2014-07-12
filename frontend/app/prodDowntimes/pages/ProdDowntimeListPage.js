// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../ProdDowntimeCollection',
  '../views/ProdDowntimeListView',
  '../views/ProdDowntimeFilterView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  ProdDowntimeCollection,
  ProdDowntimeListView,
  ProdDowntimeFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'prodDowntimeList',

    breadcrumbs: [
      t.bound('prodDowntimes', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      return [
        pageActions.jump(this, this.prodDowntimeList),
        pageActions.export(layout, this, this.prodDowntimeList)
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
      this.prodDowntimeList = bindLoadingMessage(
        new ProdDowntimeCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ProdDowntimeListView({collection: this.prodDowntimeList});

      this.filterView = new ProdDowntimeFilterView({
        model: {
          rqlQuery: this.prodDowntimeList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.prodDowntimeList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.prodDowntimeList.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.prodDowntimeList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
