// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../settings',
  '../views/ReportSettingsView',
  'app/prodTasks/ProdTaskCollection',
  'app/delayReasons/storage'
], function(
  $,
  t,
  bindLoadingMessage,
  View,
  settings,
  ReportSettingsView,
  ProdTaskCollection,
  delayReasonsStorage
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

    destroy: function()
    {
      settings.release();
      delayReasonsStorage.release();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(settings.acquire(), this);
      this.prodTasks = bindLoadingMessage(new ProdTaskCollection(), this);
      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);
    },

    defineViews: function()
    {
      this.view = new ReportSettingsView({
        initialTab: this.options.initialTab,
        initialSubtab: this.options.initialSubtab,
        settings: this.settings,
        prodTasks: this.prodTasks,
        delayReasons: this.delayReasons
      });
    },

    load: function(when)
    {
      var page = this;

      return when(page.settings.fetchIfEmpty(function()
      {
        return $.when(
          page.prodTasks.fetch({reset: true}),
          page.delayReasons.isEmpty() ? page.delayReasons.fetch({reset: true}) : null
        );
      }));
    },

    afterRender: function()
    {
      settings.acquire();
      delayReasonsStorage.acquire();
    }

  });
});
