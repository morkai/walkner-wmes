// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../settings',
  '../views/ReportSettingsView',
  'app/prodTasks/ProdTaskCollection'
], function(
  t,
  bindLoadingMessage,
  View,
  settings,
  ReportSettingsView,
  ProdTaskCollection
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
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(settings.acquire(), this);
      this.prodTasks = bindLoadingMessage(new ProdTaskCollection(), this);
    },

    defineViews: function()
    {
      this.view = new ReportSettingsView({
        initialTab: this.options.initialTab,
        initialSubtab: this.options.initialSubtab,
        settings: this.settings,
        prodTasks: this.prodTasks
      });
    },

    load: function(when)
    {
      return when(this.settings.fetchIfEmpty(function()
      {
        return this.prodTasks.fetch({reset: true});
      }, this));
    },

    afterRender: function()
    {
      settings.acquire();
    }

  });
});
