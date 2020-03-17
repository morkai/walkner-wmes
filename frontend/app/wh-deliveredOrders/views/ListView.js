// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  './FormView'
], function(
  user,
  viewport,
  ListView,
  FormView
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
        var model = this.collection.get(this.$(e.currentTarget).closest('.list-item')[0].dataset.id);
        var dialogView = new FormView({
          model: model
        });

        viewport.showDialog(dialogView, this.t('FORM:edit:title'));
      },

      'click .action-finish': function(e)
      {
        viewport.msg.saving();

        var model = this.collection.get(this.$(e.currentTarget).closest('.list-item')[0].dataset.id);

        var req = this.promised(model.save(
          {qtyDone: model.get('qtyTodo')},
          {wait: true}
        ));

        req.fail(function()
        {
          viewport.msg.savingFailed();
        });

        req.done(function()
        {
          viewport.msg.saved();
        });
      }

    }, ListView.prototype.events),

    columns: [
      {id: 'line', className: 'is-min', tdClassName: 'text-fixed'},
      {id: 'sapOrder', className: 'is-min'},
      {id: 'qty', className: 'is-min text-right', tdClassName: 'text-right'},
      {id: 'pceTime', className: 'is-min'},
      {id: 'date', className: 'is-min'},
      {id: 'set', className: 'is-min'},
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
          className: row.qtyDone < row.qtyTodo ? '' : 'disabled'
        });

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
      });
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
    }

  });
});
