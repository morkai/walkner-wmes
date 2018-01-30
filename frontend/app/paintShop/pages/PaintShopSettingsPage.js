// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../PaintShopSettingCollection',
  '../views/PaintShopSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  PaintShopSettingCollection,
  PaintShopSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          href: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          label: t.bound('paintShop', 'BREADCRUMBS:base')
        },
        t.bound('paintShop', 'BREADCRUMBS:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(new PaintShopSettingCollection(null, {pubsub: this.pubsub}), this);
    },

    defineViews: function()
    {
      this.view = new PaintShopSettingsView({
        initialTab: this.options.initialTab,
        settings: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
