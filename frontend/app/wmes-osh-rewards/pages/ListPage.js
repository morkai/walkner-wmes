// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  'app/wmes-osh-common/dictionaries',
  '../views/FilterView',
  '../views/ListView'
], function(
  FilteredListPage,
  pageActions,
  dictionaries,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView,
    ListView,

    className: 'is-colored',

    columns: [
      {id: 'rid', className: 'is-min'},
      {id: 'recipient', className: 'is-min'},
      {id: 'subject', className: 'is-overflow w300'},
      {id: 'amount', className: 'is-min', tdClassName: 'text-right'},
      {id: 'createdAt', className: 'is-min'},
      {id: 'creator', className: 'is-min'},
      {id: 'paidAt', className: 'is-min'},
      {id: 'payer', className: 'is-min'},
      '-'
    ],

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
    }

  });
});
