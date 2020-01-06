// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/ListView',
  './createPageBreadcrumbs',
  'app/core/templates/listPage'
], function(
  _,
  $,
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
      return [pageActions.add(this.getDefaultModel())];
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
      this[this.collection ? 'collection' : 'model'] = bindLoadingMessage(this.getDefaultModel(), this);
    },

    defineViews: function()
    {
      this.listView = this.createListView();

      this.filterView = this.createFilterView();

      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);
      this.listenTo(this.listView, 'showFilter', this.onShowFilter);
    },

    createListView: function()
    {
      var ListViewClass = this.getListViewClass();

      return new ListViewClass(this.getListViewOptions());
    },

    getListViewClass: function()
    {
      return this.ListView || this.options.ListView || ListView;
    },

    getListViewOptions: function()
    {
      var ListViewClass = this.getListViewClass();

      return {
        collection: this.collection,
        model: this.collection ? undefined : this.getDefaultModel(),
        columns: this.options.columns
          || this.columns
          || ListViewClass.prototype.columns,
        serializeRow: this.options.serializeRow
          || this.serializeRow
          || ListViewClass.prototype.serializeRow,
        serializeActions: this.options.serializeActions
          || this.serializeActions
          || ListViewClass.prototype.serializeActions,
        className: _.find([
          this.options.listClassName,
          this.listClassName,
          ListViewClass.prototype.className,
          'is-clickable'
        ], function(className) { return className !== undefined; })
      };
    },

    createFilterView: function()
    {
      var FilterViewClass = this.getFilterViewClass();

      return new FilterViewClass(this.getFilterViewOptions());
    },

    getFilterViewClass: function()
    {
      return this.FilterView || this.options.FilterView;
    },

    getFilterViewOptions: function()
    {
      return {
        model: this.getDefaultModel()
      };
    },

    load: function(when)
    {
      return when(this.getDefaultModel().fetch({reset: true}));
    },

    onFilterChanged: function(newRqlQuery)
    {
      this.getDefaultModel().rqlQuery = newRqlQuery;

      this.refreshCollection();
    },

    onShowFilter: function(filter)
    {
      if (filter === 'rid')
      {
        var $input = $('.page-actions-jump .form-control');

        if ($input.length)
        {
          $input.focus();

          return;
        }
      }

      this.filterView.showFilter(filter);
    },

    refreshCollection: function()
    {
      this.listView.refreshCollectionNow();
      this.updateClientUrl();
    },

    updateClientUrl: function()
    {
      var model = this.getDefaultModel();

      this.broker.publish('router.navigate', {
        url: model.genClientUrl() + '?' + model.rqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
