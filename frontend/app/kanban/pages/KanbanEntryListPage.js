// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../state',
  '../views/KanbanEntryListView'
], function(
  $,
  t,
  user,
  viewport,
  View,
  bindLoadingMessage,
  state,
  KanbanEntryListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

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
      return [{
        label: t.bound('kanban', 'pa:components'),
        href: '#kanban/components'
      }, {
        label: t.bound('kanban', 'pa:supplyAreas'),
        href: '#kanban/supplyAreas'
      }, {
        id: '-import',
        label: t.bound('kanban', 'pa:import'),
        icon: 'download',
        privileges: function() { return user.isAllowedTo('KANBAN:MANAGE', 'FN:process-engineer'); },
        callback: this.import.bind(this)
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView(this.listView);
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
    },

    defineBindings: function()
    {
      this.listenTo(this.model.tableView, 'change', this.onTableViewChanged);
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
    }

  });
});
