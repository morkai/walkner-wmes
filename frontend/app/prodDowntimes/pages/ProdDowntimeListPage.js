define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../ProdDowntimeCollection',
  '../views/ProdDowntimeListView',
  '../views/ProdDowntimeFilterView',
  'app/prodDowntimes/templates/listPage'
], function(
  $,
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
      this.setView('.prodDowntimes-list-container', this.listView);
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

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.prodDowntimeList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
