// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  '../ReportSettingCollection',
  '../views/ReportSettingsView'
], function(
  t,
  orgUnits,
  View,
  ReportSettingCollection,
  ReportSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'reportSettings',

    breadcrumbs: function()
    {
      return [
        t.bound('reports', 'BREADCRUMBS:reports'),
        t.bound('reports', 'BREADCRUMBS:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.settings = new ReportSettingCollection(null, {
        pubsub: this.pubsub
      });
    },

    defineViews: function()
    {
      this.view = new ReportSettingsView({
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
