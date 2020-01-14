// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../MorSettingCollection',
  '../views/MorSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  MorSettingCollection,
  MorSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('mor', 'BREADCRUMB:base'),
          href: '#mor'
        },
        t.bound('mor', 'BREADCRUMB:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(new MorSettingCollection(), this);
    },

    defineViews: function()
    {
      this.view = new MorSettingsView({
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
