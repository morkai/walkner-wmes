// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/paintShopPaints/views/PaintShopPaintFilterView',
  'i18n!app/nls/paintShopPaints'
], function(
  pageActions,
  FilteredListPage,
  PaintShopPaintFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: PaintShopPaintFilterView,
    baseBreadcrumb: true,

    actions: function()
    {
      return [
        pageActions.jump(this, this.collection, {mode: 'id'}),
        pageActions.add(this.collection, 'PAINT_SHOP:MANAGE')
      ];
    },

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'shelf', className: 'is-min'},
      {id: 'bin', className: 'is-min'},
      'name'
    ]

  });
});
