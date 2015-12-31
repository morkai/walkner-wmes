// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/data/orderStatuses',
  'app/orderStatuses/util/renderOrderStatusLabel',
  '../util/openOrderPrint'
], function(
  _,
  t,
  user,
  ListView,
  orderStatuses,
  renderOrderStatusLabel,
  openOrderPrint
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    remoteTopics: {
      'orders.synced': 'refreshCollection',
      'orders.updated.*': function(message)
      {
        if (this.collection.get(message._id))
        {
          this.refreshCollection();
        }
      }
    },

    events: _.extend({

      'click .action-print': function(e)
      {
        return openOrderPrint(e, e.currentTarget);
      }

    }, ListView.prototype.events),

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'nc12', className: 'is-min'},
      'name',
      {id: 'mrp', className: 'is-min'},
      {id: 'qtyUnit', label: t.bound('orders', 'PROPERTY:qty'), className: 'is-min'},
      {id: 'startDateText', label: t.bound('orders', 'PROPERTY:startDate'), className: 'is-min'},
      {id: 'finishDateText', label: t.bound('orders', 'PROPERTY:finishDate'), className: 'is-min'},
      {id: 'delayReason', className: 'is-min'},
      {id: 'statusLabels', label: t.bound('orders', 'PROPERTY:statuses')}
    ],

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        return [
          ListView.actions.viewDetails(collection.get(row._id)),
          {
            id: 'print',
            icon: 'print',
            label: t.bound('orders', 'LIST:ACTION:print'),
            href: '/orders/' + row._id + '.html?print'
          }
        ];
      };
    },

    serializeRows: function()
    {
      var delayReasons = this.delayReasons;

      return this.collection.map(function(model)
      {
        var row = model.toJSON();
        var delayReason = delayReasons.get(row.delayReason);

        row.statusLabels = orderStatuses.findAndFill(row.statuses).map(renderOrderStatusLabel).join('');
        row.delayReason = delayReason ? delayReason.getLabel() : '-';

        return row;
      });
    }

  });
});
