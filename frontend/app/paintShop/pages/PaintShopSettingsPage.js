// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/paintShopPaints/PaintShopPaintCollection',
  '../PaintShopSettingCollection',
  '../views/PaintShopSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  PaintShopPaintCollection,
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
          label: t.bound('paintShop', 'BREADCRUMB:base')
        },
        t.bound('paintShop', 'BREADCRUMB:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new PaintShopSettingCollection(null, {pubsub: this.pubsub}), this);

      this.paints = bindLoadingMessage(new PaintShopPaintCollection(null, {
        rqlQuery: 'select(name)'
      }), this);
    },

    defineViews: function()
    {
      this.view = new PaintShopSettingsView({
        initialTab: this.options.initialTab,
        settings: this.settings,
        paints: this.paints
      });
    },

    load: function(when)
    {
      return when(
        this.settings.fetch({reset: true}),
        this.paints.fetch({reset: true})
      );
    }

  });
});
