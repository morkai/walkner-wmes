// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../UserSettingCollection',
  '../views/UserSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  UserSettingCollection,
  UserSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('users', 'BREADCRUMB:browse'),
          href: '#users'
        },
        t.bound('users', 'BREADCRUMB:settings')
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
      this.view = new UserSettingsView({
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
