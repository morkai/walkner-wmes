// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../settings',
  '../views/XiconfSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  settings,
  XiconfSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('xiconf', 'BREADCRUMB:base')
        },
        t.bound('xiconf', 'BREADCRUMB:settings')
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
    },

    defineViews: function()
    {
      this.view = new XiconfSettingsView({
        initialTab: this.options.initialTab,
        settings: this.model
      });
    },

    load: function(when)
    {
      if (this.model.isEmpty())
      {
        return when(this.model.fetch({reset: true}));
      }

      return when();
    },

    afterRender: function()
    {
      settings.acquire();
    }

  });
});
