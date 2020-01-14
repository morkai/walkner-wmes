// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/prodTasks/ProdTaskCollection',
  '../settings',
  '../views/FteSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  ProdTaskCollection,
  settings,
  FteSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('fte', 'BREADCRUMB:base')
        },
        t.bound('fte', 'BREADCRUMB:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    destroy: function()
    {
      settings.release();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(settings.acquire(), this);

      this.prodTasks = bindLoadingMessage(new ProdTaskCollection(), this);
    },

    defineViews: function()
    {
      this.view = new FteSettingsView({
        initialTab: this.options.initialTab,
        settings: this.model,
        prodTasks: this.prodTasks
      });
    },

    load: function(when)
    {
      if (this.model.isEmpty())
      {
        return when(
          this.model.fetch({reset: true}),
          this.prodTasks.fetch({reset: true})
        );
      }

      return when(this.prodTasks.fetch({reset: true}));
    },

    afterRender: function()
    {
      settings.acquire();
    }

  });
});
