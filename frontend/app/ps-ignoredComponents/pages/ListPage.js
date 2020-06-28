// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/ps-ignoredComponents/views/FilterView',
  'i18n!app/nls/ps-ignoredComponents'
], function(
  pageActions,
  FilteredListPage,
  FilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,

    baseBreadcrumb: function()
    {
      return '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d');
    },

    actions: function()
    {
      return [
        pageActions.jump(this, this.collection, {mode: 'id'}),
        pageActions.add(this.collection, 'PAINT_SHOP:MANAGE')
      ];
    },

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'mrps', className: 'is-min'},
      'name'
    ]

  });
});
