// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../WiringSettingCollection',
  '../views/SettingsView'
], function(
  View,
  bindLoadingMessage,
  WiringSettingCollection,
  SettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    modelProperty: 'settings',

    breadcrumbs: function()
    {
      return [
        {
          href: '#wiring/' + (window.WMES_LAST_WIRING_DATE || '0d'),
          label: this.t('BREADCRUMBS:base')
        },
        this.t('BREADCRUMBS:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new WiringSettingCollection(null, {pubsub: this.pubsub}), this);
    },

    defineViews: function()
    {
      this.view = new SettingsView({
        initialTab: this.options.initialTab,
        settings: this.settings
      });
    },

    load: function(when)
    {
      return when(this.settings.fetch({reset: true}));
    }

  });
});
