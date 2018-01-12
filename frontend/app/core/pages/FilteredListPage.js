// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/ListView',
  './createPageBreadcrumbs',
  'app/core/templates/listPage'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  ListView,
  createPageBreadcrumbs,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this);
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
        model: this.model,
        columns: this.options.columns || this.columns || ListViewClass.prototype.columns,
        serializeRow: this.options.serializeRow || this.serializeRow || ListViewClass.prototype.serializeRow,
        className: this.options.listClassName
          || this.listClassName
          || ListViewClass.prototype.className
          || 'is-clickable'
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
      this.updateClientUrl();
    },

    updateClientUrl: function()
    {
      var model = this.collection || this.model;

      this.broker.publish('router.navigate', {
        url: model.genClientUrl() + '?' + model.rqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
