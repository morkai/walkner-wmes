// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../settings',
  '../views/SettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  settings,
  SettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: this.t('BREADCRUMB:browse'),
          href: '#fap/entries'
        },
        t.bound(this.model.getNlsDomain(), 'BREADCRUMB:settings')
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
      this.view = new SettingsView({
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
