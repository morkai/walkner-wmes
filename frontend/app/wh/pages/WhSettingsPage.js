// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../settings',
  '../WhUserCollection',
  '../views/WhSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  settings,
  WhUserCollection,
  WhSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: this.t('BREADCRUMB:base'),
          href: '#wh/plans/0d'
        },
        this.t('BREADCRUMB:settings')
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

      this.whUsers = bindLoadingMessage(new WhUserCollection(), this);

      this.whUsers.setUpPubsub(this.pubsub.sandbox());
    },

    defineViews: function()
    {
      this.view = new WhSettingsView({
        initialTab: this.options.initialTab,
        settings: this.model,
        whUsers: this.whUsers
      });
    },

    load: function(when)
    {
      return when(
        this.model.fetchIfEmpty(),
        this.whUsers.fetch({reset: true})
      );
    },

    afterRender: function()
    {
      settings.acquire();
    }

  });
});
