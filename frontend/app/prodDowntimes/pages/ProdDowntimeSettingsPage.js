// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  '../ProdDowntimeSettingCollection',
  '../views/ProdDowntimeSettingsView'
], function(
  t,
  orgUnits,
  View,
  ProdDowntimeSettingCollection,
  ProdDowntimeSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodDowntimes', 'BREADCRUMBS:browse'),
          href: '#prodDowntimes'
        },
        t.bound('prodDowntimes', 'BREADCRUMBS:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.settings = new ProdDowntimeSettingCollection(null, {
        pubsub: this.pubsub
      });
    },

    defineViews: function()
    {
      this.view = new ProdDowntimeSettingsView({
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
