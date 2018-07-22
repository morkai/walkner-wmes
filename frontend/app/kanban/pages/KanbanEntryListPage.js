// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../state',
  '../views/KanbanEntryListView',
  '../views/KanbanPrintQueueBuilderView',
  'app/kanban/templates/page',
  'app/kanban/templates/dictionariesAction',
  'app/kanban/templates/builder/action'
], function(
  $,
  t,
  time,
  user,
  viewport,
  View,
  bindLoadingMessage,
  state,
  KanbanEntryListView,
  KanbanPrintQueueBuilderView,
  pageTemplate,
  dictionariesActionTemplate,
  builderActionTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: pageTemplate,

    localTopics: {
      'socket.connected': function()
      {
        this.model.load(true);
      }
    },

    remoteTopics: {
      'kanban.import.*': function(message, topic)
      {
        var success = topic.indexOf('success') !== -1;

        viewport.msg.show({
          type: success ? 'success' : 'error',
          time: 2500,
          text: this.t('msg:import:' + (success ? 'success' : 'failure'))
        });

        this.$id('import').prop('disabled', false);
      }
    },

    breadcrumbs: function()
    {
      return [t.bound('kanban', 'bc:base')];
    },

    actions: function()
    {
      var page = this;

      return [{
        template: function()
        {
          return builderActionTemplate({
            idPrefix: page.idPrefix
          });
        },
        afterRender: function()
        {
          page.$id('builderToggle').on('click', page.onBuilderToggleClick.bind(page));
          page.$id('builderAddAll').on('click', page.onBuilderAddAllClick.bind(page));
          page.updateBuilderCount();
        }
      }, {
        id: '-import',
        label: t.bound('kanban', 'pa:import'),
        icon: 'download',
        privileges: function() { return user.isAllowedTo('KANBAN:MANAGE', 'FN:process-engineer'); },
        callback: page.import.bind(page),
        afterRender: page.updateImportedAt.bind(page)
      }, {
        template: dictionariesActionTemplate
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-list', this.listView);
      this.setView('#-builder', this.builderView);
    },

    destroy: function()
    {
      document.body.classList.remove('no-overflow', 'no-ft');

      this.model.unload();
      this.model = null;
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(state, this);
    },

    defineViews: function()
    {
      this.listView = new KanbanEntryListView({model: this.model});

      this.builderView = new KanbanPrintQueueBuilderView({model: this.model});
    },

    defineBindings: function()
    {
      this.listenTo(this.model.tableView, 'change', this.onTableViewChanged);

      this.listenTo(this.model.settings, 'change', this.onSettingChanged);

      this.listenTo(this.model.builder, 'add remove reset', this.updateBuilderCount);
      this.listenTo(this.model.builder, 'add', this.onBuilderAdd);

      this.listenTo(this.builderView, 'find', this.listView.find.bind(this.listView));
      this.listenTo(this.builderView, 'shown hidden', this.toggleBuilderToggle);
    },

    load: function(when)
    {
      return when(this.model.load(false));
    },

    afterRender: function()
    {
      document.body.classList.add('no-overflow', 'no-ft');

      this.model.load(false);
    },

    onTableViewChanged: function(tableView, options)
    {
      if (options.save)
      {
        this.promised(tableView.save());
      }
    },

    onSettingChanged: function(setting)
    {
      if (setting.id === 'kanban.import.importedAt')
      {
        this.updateImportedAt();
      }
    },

    import: function(e)
    {
      var page = this;
      var $btn = $(e.currentTarget).find('.btn');

      if ($btn.prop('disabled'))
      {
        return;
      }

      $btn.prop('disabled', true);

      var req = page.ajax({
        method: 'POST',
        url: '/kanban;import'
      });

      req.fail(function()
      {
        var error = req.responseJSON && req.responseJSON.error || {};
        var code = error.code;
        var nlsKey = t.has('kanban', 'msg:import:' + error.code) ? code : 'failure';

        viewport.msg.show({
          type: code === 'IN_PROGRESS' ? 'warning' : 'error',
          time: 3000,
          text: page.t('msg:import:' + nlsKey)
        });

        $btn.prop('disabled', code === 'IN_PROGRESS');
      });

      req.done(function()
      {
        viewport.msg.show({
          type: 'info',
          time: 2000,
          text: page.t('msg:import:started')
        });
      });
    },

    updateImportedAt: function()
    {
      this.$id('import').prop('title', this.t('pa:import:title', {
        importedAt: time.format(this.model.settings.getValue('import.importedAt'), 'LLLL')
      }));
    },

    updateBuilderCount: function()
    {
      this.$id('builderCount')
        .text(this.model.builder.length)
        .closest('.btn')
        .prop('disabled', this.model.builder.length === 0);
    },

    onBuilderAdd: function()
    {
      if (!this.builderView.shown && this.model.builder.length === 1)
      {
        this.toggleBuilderVisibility();
      }
    },

    toggleBuilderVisibility: function()
    {
      if (this.builderView.shown)
      {
        this.builderView.hide();
      }
      else
      {
        this.builderView.show();
      }
    },

    toggleBuilderToggle: function()
    {
      this.$id('builderToggle').toggleClass('active', this.builderView.shown).blur();
    },

    onBuilderToggleClick: function()
    {
      document.body.focus();

      this.toggleBuilderVisibility();
    },

    onBuilderAddAllClick: function()
    {
      this.model.builder.addFromEntries(this.model.entries.filtered);
    }

  });
});
