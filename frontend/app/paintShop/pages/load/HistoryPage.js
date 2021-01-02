// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/FilteredListPage',
  'app/paintShop/PaintShopLoadReasonCollection',
  'app/paintShop/views/load/ListFilterView',
  'app/paintShop/views/load/ListView'
], function(
  viewport,
  pageActions,
  bindLoadingMessage,
  FilteredListPage,
  PaintShopLoadReasonCollection,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    breadcrumbs: function()
    {
      var page = this;

      return [
        {
          href: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          label: page.t('BREADCRUMB:base')
        },
        {
          href: '#paintShop/load/monitoring',
          label: page.t('BREADCRUMB:load')
        },
        this.t('load:history:breadcrumb')
      ];
    },

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this),
        {
          href: '#paintShop/load/report',
          icon: 'line-chart',
          label: this.t('load:report:pageAction')
        },
        {
          href: '#paintShop;settings?tab=load',
          icon: 'cogs',
          label: this.t('PAGE_ACTION:settings'),
          privileges: 'PAINT_SHOP:MANAGE'
        }
      ];
    },

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.apply(this, arguments);

      this.reasons = bindLoadingMessage(new PaintShopLoadReasonCollection(), this);
    },

    getListViewOptions: function()
    {
      return Object.assign(FilteredListPage.prototype.getListViewOptions.apply(this, arguments), {
        reasons: this.reasons
      });
    },

    load: function(when)
    {
      return when(
        this.reasons.fetch({reset: true}),
        this.collection.fetch({reset: true})
      );
    }

  });
});
