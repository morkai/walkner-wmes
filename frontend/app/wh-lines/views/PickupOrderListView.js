// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/core/views/ListView',
  'i18n!app/nls/wh'
], function(
  _,
  user,
  time,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    localTopics: {
      'socket.connected': 'refreshCollectionNow'
    },

    remoteTopics: {
      'old.wh.orders.changed.*': function(message)
      {
        var line = this.options.line;
        var whOrders = this.collection;

        message.changes.removed.forEach(function(id)
        {
          whOrders.remove(id);
        });

        message.changes.changed.forEach(function(newData)
        {
          var whOrder = whOrders.get(newData._id);

          if (whOrder)
          {
            whOrder.set(newData);
          }
        });

        message.changes.added.forEach(function(whOrder)
        {
          if (_.some(whOrder.lines, function(whOrderLine) { return whOrderLine._id === line; }))
          {
            whOrders.add(whOrder);
          }
        });
      },
      'old.wh.orders.updated': function(message)
      {
        this.collection.update(message.updated || []);
      }
    },

    columns: function()
    {
      return [
        {id: 'sapOrder', className: 'is-min', label: this.t('wh', 'prop:order')},
        {id: 'qty', className: 'is-min text-right', tdClassName: 'text-right', label: this.t('wh', 'prop:qty')},
        {id: 'date', className: 'is-min', label: this.t('wh', 'prop:plan')},
        {id: 'set', className: 'is-min text-center', label: this.t('wh', 'prop:set')},
        {id: 'status', className: 'is-min', label: this.t('wh', 'prop:whStatus')},
        '-'
      ];
    },

    actions: null,

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'add change remove', this.render);
      });
    },

    serializeRows: function()
    {
      var view = this;
      var rows = [];
      var sets = {};

      view.collection.forEach(function(whOrder)
      {
        var key = whOrder.get('date') + ':' + whOrder.get('set');

        if (!sets[key])
        {
          sets[key] = {
            status: 'finished',
            orders: []
          };
        }

        var set = sets[key];
        var status = whOrder.get('status');

        if (status === 'problem')
        {
          var finished = _.every(whOrder.get('funcs'), function(func)
          {
            return func.status === 'problem' || func.status === 'finished';
          });

          if (!finished)
          {
            set.status = 'started';
          }
        }
        else if (status === 'started')
        {
          set.status = 'started';
        }

        set.orders.push(whOrder);
      });

      _.forEach(sets, function(set)
      {
        if (set.status !== view.options.status)
        {
          return;
        }

        set.orders.forEach(function(whOrder)
        {
          rows.push(view.serializeRow(whOrder));
        });
      });

      return rows;
    },

    serializeRow: function(whOrder)
    {
      var row = {
        sapOrder: whOrder.get('order'),
        qty: whOrder.get('qty').toLocaleString(),
        date: time.utc.format(whOrder.get('date'), 'L'),
        set: whOrder.get('set').toLocaleString(),
        status: this.t('wh', 'status:' + whOrder.get('status'))
      };

      if (user.isAllowedTo('LOCAL', 'ORDERS:VIEW'))
      {
        row.sapOrder = '<a href="#orders/' + row.sapOrder + '" target="_blank">' + row.sapOrder + '</a>';
      }

      var date = time.utc.format(whOrder.get('date'), 'YYYY-MM-DD');

      if (user.isAllowedTo('WH:VIEW'))
      {
        row.date = '<a href="#wh/pickup/' + date + '?order=' + (whOrder.id || '') + '" target="_blank">'
          + row.date + '</a>';

        row.set = '<a href="#wh/pickup/' + date + '?set=' + (whOrder.id || '') + '"'
          + ' target="_blank" style="display: block">' + row.set + '</a>';
      }

      return row;
    }

  });
});
