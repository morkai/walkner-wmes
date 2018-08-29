// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../state',
  '../views/KanbanSettingsView'
], function(
  t,
  bindLoadingMessage,
  View,
  kanbanState,
  KanbanSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('kanban', 'bc:base'),
          href: '#kanban'
        },
        t.bound('kanban', 'bc:settings')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    destroy: function()
    {
      kanbanState.unload();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(kanbanState.settings, this);
    },

    defineViews: function()
    {
      this.view = new KanbanSettingsView({
        initialTab: this.options.initialTab,
        settings: this.model
      });
    },

    load: function(when)
    {
      return when(kanbanState.load(false));
    },

    afterRender: function()
    {
      kanbanState.load(false);
    }

  });
});
