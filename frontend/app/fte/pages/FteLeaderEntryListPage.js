define([
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../FteLeaderEntryCollection',
  '../views/FteLeaderEntryListView',
  '../views/FteEntryFilterView',
  'app/fte/templates/listPage'
], function(
  $,
  t,
  bindLoadingMessage,
  pageActions,
  View,
  FteLeaderEntryCollection,
  FteLeaderEntryListView,
  FteEntryFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'fteLeaderEntryList',

    breadcrumbs: [
      t.bound('fte', 'BREADCRUMBS:leader:entryList')
    ],

    actions: [{
      label: t.bound('fte', 'PAGE_ACTION:currentEntry'),
      href: '#fte/leader/current',
      icon: 'edit',
      privileges: 'FTE:LEADER:MANAGE'
    }],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.fte-list-container', this.listView);
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new FteLeaderEntryCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new FteEntryFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        }
      });

      this.listView = new FteLeaderEntryListView({collection: this.collection});

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
    }

  });
});
