// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../DrillingSettingCollection',
  '../views/SettingsView'
], function(
  View,
  bindLoadingMessage,
  DrillingSettingCollection,
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
          href: '#drilling/' + (window.WMES_LAST_DRILLING_DATE || '0d'),
          label: this.t('BREADCRUMB:base')
        },
        this.t('BREADCRUMB:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new DrillingSettingCollection(null, {pubsub: this.pubsub}), this);
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
