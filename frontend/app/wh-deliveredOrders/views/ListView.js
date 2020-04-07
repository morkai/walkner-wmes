// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  './FormView',
  'app/wh-deliveredOrders/templates/confirm'
], function(
  $,
  user,
  viewport,
  ListView,
  FormView,
  confirmTemplate
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    localTopics: {
      'socket.connected': 'refreshCollectionNow'
    },

    remoteTopics: function()
    {
      var topics = {};

      topics[this.collection.getTopicPrefix() + '.updated'] = 'onUpdated';

      return topics;
    },

    events: Object.assign({

      'click .action-edit': function(e)
      {
        this.hidePopover();

        var id = this.$(e.currentTarget).closest('.list-item')[0].dataset.id;
        var model = this.collection.get(id);
        var dialogView = new FormView({
          model: model
        });

        viewport.showDialog(dialogView, this.t('FORM:edit:title'));
      },

      'click .action-finish': function(e)
      {
        this.confirm(e.currentTarget, this.finish.bind(this));
      },

      'click .action-block': function(e)
      {
        this.confirm(e.currentTarget, this.block.bind(this));
      },

      'click .action-unblock': function(e)
      {
        this.confirm(e.currentTarget, this.unblock.bind(this));
      }

    }, ListView.prototype.events),

    columns: [
      {id: 'line', className: 'is-min', tdClassName: 'text-fixed'},
      {id: 'sapOrder', className: 'is-min'},
      {id: 'qty', className: 'is-min text-right', tdClassName: 'text-right'},
      {id: 'pceTime', className: 'is-min'},
      {id: 'date', className: 'is-min'},
      {id: 'set', className: 'is-min'},
      {id: 'status', valueProperty: 'statusText', className: 'is-min'},
      '-'
    ],

    actions: function()
    {
      var view = this;
      var canManage = user.isAllowedTo('WH:MANAGE');

      return function(row)
      {
        var actions = [];

        if (!canManage)
        {
          return actions;
        }

        actions.push({
          id: 'finish',
          icon: 'check',
          label: view.t('LIST:ACTION:finish'),
          className: row.status === 'done' ? 'disabled' : ''
        });

        if (row.status === 'blocked')
        {
          actions.push({
            id: 'unblock',
            icon: 'unlock',
            label: view.t('LIST:ACTION:unblock')
          });
        }
        else
        {
          actions.push({
            id: 'block',
            icon: 'lock',
            label: view.t('LIST:ACTION:block'),
            className: row.status === 'done' ? 'disabled' : ''
          });
        }

        actions.push({
          id: 'edit',
          icon: 'edit',
          label: view.t('core', 'LIST:ACTION:edit')
        });

        return actions;
      };
    },

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'change', this.render);
        this.listenTo(this.collection, 'reset', this.onReset);
      });

      $(window)
        .on('resize.' + this.idPrefix, this.onWindowResize.bind(this))
        .on('keydown.' + this.idPrefix, this.onWindowKeyDown.bind(this));
    },

    destroy: function()
    {
      ListView.prototype.destroy.apply(this, arguments);

      $(window).off('.' + this.idPrefix);

      this.hidePopover();
    },

    onUpdated: function(message)
    {
      var view = this;
      var refresh = false;
      var line = view.collection.getLineFilter();
      var sapOrder = view.collection.getSapOrderFilter();

      (message.added || []).forEach(function(data)
      {
        if (data.line === line || data.sapOrder === sapOrder)
        {
          refresh = true;
        }
      });

      (message.updated || []).forEach(function(data)
      {
        var model = view.collection.get(data._id);

        if (model)
        {
          model.set(data);
        }
        else if (data.line === line || data.sapOrder === sapOrder)
        {
          refresh = true;
        }
      });

      if (refresh)
      {
        view.refreshCollection();
      }
    },

    hidePopover: function()
    {
      if (this.$popover)
      {
        this.$popover.popover('destroy');
        this.$popover = null;
      }
    },

    confirm: function(actionEl, action)
    {
      var view = this;
      var oldActionId = view.$popover && view.$popover.data('actionId') || null;
      var newActionId = actionEl.dataset.id;
      var oldModelId = view.$popover && view.$popover.data('modelId') || null;
      var newModelId = view.$(actionEl).closest('.list-item')[0].dataset.id;

      view.hidePopover();

      if (newActionId === oldActionId && newModelId === oldModelId)
      {
        return;
      }

      view.$popover = view.$(actionEl).popover({
        container: view.el,
        trigger: 'manual',
        placement: 'left',
        html: true,
        title: function() { return ''; },
        content: view.renderPartialHtml(confirmTemplate, {
          action: actionEl.dataset.id
        }),
        css: {
          marginLeft: '2px'
        },
        contentCss: {
          padding: '0'
        }
      });

      view.$popover
        .data('actionId', newActionId)
        .data('modelId', newModelId)
        .popover('show');

      var $tip = view.$popover.data('bs.popover').$tip;

      $tip.find('.btn-danger').on('click', function()
      {
        view.hidePopover();

        return false;
      });

      $tip.find('.btn-success').on('click', function()
      {
        view.hidePopover();
        action(newModelId);

        return false;
      });
    },

    finish: function(id)
    {
      this.edit(id, {qtyDone: this.collection.get(id).get('qtyTodo')});
    },

    block: function(id)
    {
      this.edit(id, {blocked: true});
    },

    unblock: function(id)
    {
      this.edit(id, {blocked: false});
    },

    edit: function(id, data)
    {
      viewport.msg.saving();

      var model = this.collection.get(id);

      var req = this.promised(model.save(data, {wait: true}));

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();
      });
    },

    onWindowResize: function()
    {
      this.hidePopover();
    },

    onWindowKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hidePopover();
      }
    },

    onReset: function()
    {
      ListView.prototype.onReset.apply(this, arguments);

      if (this.$popover && !this.collection.get(this.$popover.data('modelId')))
      {
        this.hidePopover();
      }
    }

  });
});
