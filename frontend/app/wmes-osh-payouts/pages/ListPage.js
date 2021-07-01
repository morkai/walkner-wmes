// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  'app/wmes-osh-common/dictionaries',
  '../views/FilterView'
], function(
  Collection,
  FilteredListPage,
  pageActions,
  dictionaries,
  FilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView,

    listClassName: 'is-clickable',

    columns: [
      {id: 'createdAt', className: 'is-min'},
      {id: 'creator', className: 'is-min'},
      {id: 'recipients', className: 'is-min', tdClassName: 'text-right'},
      {id: 'count', className: 'is-min', tdClassName: 'text-right'},
      {id: 'amount', className: 'is-min', tdClassName: 'text-right'},
      {id: 'description', className: 'is-overflow w300'},
      {id: 'companies', className: 'is-overflow w300'},
      '-'
    ],

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:reports'),
        {
          href: '#osh/reports/rewards',
          label: this.t('BREADCRUMB:base')
        },
        this.t('BREADCRUMB:browse')
      ];
    },

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection, false)
      ];
    },

    initialize: function()
    {
      FilteredListPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    },

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.apply(this, arguments);

      this.companies = new Collection(null, {
        url: '/osh/payouts;companies',
        paginate: false,
        comparator: (a, b) =>
        {
          return a.get('label').localeCompare(b.get('label'));
        }
      });
    },

    getFilterViewOptions: function()
    {
      return Object.assign(FilteredListPage.prototype.getFilterViewOptions.apply(this, arguments), {
        companies: this.companies
      });
    },

    getListViewOptions: function()
    {
      return Object.assign(FilteredListPage.prototype.getListViewOptions.apply(this, arguments), {
        actions: []
      });
    },

    load: function(when)
    {
      return when(
        this.collection.fetch({reset: true}),
        this.companies.fetch({reset: true})
      );
    }

  });
});
