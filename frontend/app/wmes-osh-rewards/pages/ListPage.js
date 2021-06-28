// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  'app/wmes-osh-common/dictionaries',
  '../views/FilterView'
], function(
  FilteredListPage,
  pageActions,
  dictionaries,
  FilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView,

    listClassName: 'is-colored',

    columns: [
      {id: 'rid', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'recipient', className: 'is-min'},
      {id: 'subject', className: 'is-overflow w300'},
      {id: 'amount', className: 'is-min', tdClassName: 'text-right'},
      {id: 'createdAt', className: 'is-min'},
      {id: 'creator', className: 'is-min'},
      {id: 'paidAt', className: 'is-min'},
      {id: 'payer', className: 'is-min'},
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

      this.listenToOnce(this.filterView, 'afterRender', () =>
      {
        this.filterView.$id('submit').click();
      });
    },

    load: function(when)
    {
      return when(dictionaries.load());
    },

    getListViewOptions: function()
    {
      return Object.assign(FilteredListPage.prototype.getListViewOptions.apply(this, arguments), {
        crudTopics: 'updated'
      });
    }

  });
});
