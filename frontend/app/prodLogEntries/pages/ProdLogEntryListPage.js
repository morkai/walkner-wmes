// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../ProdLogEntryCollection',
  '../views/ProdLogEntryListView',
  '../views/ProdLogEntryFilterView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  bindLoadingMessage,
  View,
  ProdLogEntryCollection,
  ProdLogEntryListView,
  ProdLogEntryFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'prodLogEntryList',

    breadcrumbs: [
      t.bound('prodLogEntries', 'BREADCRUMBS:browse')
    ],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    defineModels: function()
    {
      this.prodLogEntryList = bindLoadingMessage(
        new ProdLogEntryCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ProdLogEntryListView({collection: this.prodLogEntryList});

      this.filterView = new ProdLogEntryFilterView({
        model: {
          rqlQuery: this.prodLogEntryList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.prodLogEntryList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.prodLogEntryList.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.prodLogEntryList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
