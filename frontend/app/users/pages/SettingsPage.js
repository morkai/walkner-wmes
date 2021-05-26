// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../UserSettingCollection',
  '../views/SettingsView'
], function(
  bindLoadingMessage,
  View,
  UserSettingCollection,
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
          href: '#users'
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
      this.model = bindLoadingMessage(new UserSettingCollection(), this);
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
      return when(this.model.fetch({reset: true}));
    }

  });
});
