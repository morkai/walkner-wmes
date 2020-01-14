// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../dictionaries',
  '../views/QiSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  dictionaries,
  QiSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('qiResults', 'BREADCRUMB:base')
        },
        t.bound('qiResults', 'BREADCRUMB:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    destroy: function()
    {
      dictionaries.unload();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(dictionaries.settings, this);
    },

    defineViews: function()
    {
      this.view = new QiSettingsView({
        initialTab: this.options.initialTab,
        settings: this.model
      });
    },

    load: function(when)
    {
      return when(dictionaries.load());
    },

    afterRender: function()
    {
      dictionaries.load();
    }

  });
});
