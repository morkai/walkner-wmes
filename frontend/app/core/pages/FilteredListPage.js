// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/ListView',
  'app/core/templates/listPage'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  ListView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [t.bound((this.collection || this.model).getNlsDomain(), 'BREADCRUMBS:browse')];
    },

    actions: function()
    {
      return [pageActions.add(this.collection || this.model)];
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
      this[this.collection ? 'collection' : 'model'] = bindLoadingMessage(this.collection || this.model, this);
    },

    defineViews: function()
    {
      this.listView = this.createListView();

      this.filterView = this.createFilterView();

      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);
    },

    createListView: function()
    {
      var ListViewClass = this.ListView || this.options.ListView || ListView;

      return new ListViewClass({
        collection: this.collection,
        model: this.model
      });
    },

    createFilterView: function()
    {
      var FilterViewClass = this.FilterView || this.options.FilterView;

      return new FilterViewClass({
        model: {
          rqlQuery: (this.collection || this.model).rqlQuery
        }
      });
    },

    load: function(when)
    {
      return when((this.collection || this.model).fetch({reset: true}));
    },

    onFilterChanged: function(newRqlQuery)
    {
      (this.collection || this.model).rqlQuery = newRqlQuery;

      this.refreshCollection();
    },

    refreshCollection: function()
    {
      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: (this.collection || this.model).genClientUrl() + '?' + (this.collection || this.model).rqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
