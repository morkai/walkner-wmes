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
  '../views/ImportXlsxDialogView',
  'app/kanban/templates/page',
  'app/kanban/templates/dictionariesAction',
  'app/kanban/templates/builder/action',
  'app/kanban/templates/importAction'
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
  ImportXlsxDialogView,
  pageTemplate,
  dictionariesActionTemplate,
  builderActionTemplate,
  importActionTemplate
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
        if (topic.indexOf('started') !== -1)
        {
          this.importing = true;
        }
        else
        {
          this.importing = false;

          var success = topic.indexOf('success') !== -1;

          viewport.msg.show({
            type: success ? 'success' : 'error',
            time: 2500,
            text: this.t('msg:import:' + (success ? 'success' : 'failure'))
          });

          this.$id('import-sap').parent().removeClass('disabled');
        }

        this.updateImportedAt();
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
          return '<span id="' + page.idPrefix + '-lastImport" class="kanban-pa-lastImport"></span>';
        }
      }, {
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
        template: function()
        {
          return importActionTemplate({
            idPrefix: page.idPrefix
          });
        },
        privileges: function() { return user.isAllowedTo('KANBAN:MANAGE', 'FN:process-engineer'); },
        afterRender: function()
        {
          page.$id('import-sap').on('click', page.importSap.bind(page));
          page.$id('import-entries').on('click', page.importEntries.bind(page));
          page.$id('import-components').on('click', page.importComponents.bind(page));
          page.updateImportedAt();
        }
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

      if (this.options.selectComponent)
      {
        this.listenToOnce(this.model.tableView, 'sync', this.onTableViewSynced);
      }

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

    onTableViewSynced: function(tableView)
    {
      tableView.setFilters({
        nc12: {
          type: 'text',
          data: this.options.selectComponent
        }
      });
    },

    onSettingChanged: function(setting)
    {
      if (setting.id === 'kanban.import.importedAt')
      {
        this.updateImportedAt();
      }
    },

    importSap: function()
    {
      var page = this;
      var $li = page.$id('import-sap').parent();

      if ($li.hasClass('disabled'))
      {
        return;
      }

      $li.addClass('disabled');

      var req = page.ajax({
        method: 'POST',
        url: '/kanban/import/sap'
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

        $li.toggleClass('disabled', code === 'IN_PROGRESS');

        if (code === 'IN_PROGRESS')
        {
          page.importing = true;
          page.updateImportedAt();
        }
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

    importComponents: function()
    {
      viewport.showDialog(
        new ImportXlsxDialogView({model: {what: 'components'}}),
        this.t('import:components:title')
      );
    },

    importEntries: function()
    {
      viewport.showDialog(
        new ImportXlsxDialogView({model: {what: 'entries'}}),
        this.t('import:entries:title')
      );
    },

    updateImportedAt: function()
    {
      var importedAt = time.format(this.model.settings.getValue('import.importedAt'), 'LL LTS');
      var html = this.t('pa:lastImport', {importedAt: importedAt});

      if (this.importing)
      {
        html = '<i class="fa fa-spinner fa-spin"></i>' + html;
      }

      this.$id('lastImport').html(html);
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
      var kanbanState = this.model;

      if (kanbanState.entries.filtered.length > 100)
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('builder:error:tooMany')
        });

        return;
      }

      kanbanState.builder.addFromEntries(kanbanState.entries.filtered.map(function(entry)
      {
        return entry.serialize(kanbanState);
      }));
    }

  });
});
