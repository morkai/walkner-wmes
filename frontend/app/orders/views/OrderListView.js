// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/data/orderStatuses',
  'app/orderStatuses/util/renderOrderStatusLabel',
  '../util/openOrderPrint',
  '../util/resolveProductName'
], function(
  _,
  t,
  user,
  ListView,
  orderStatuses,
  renderOrderStatusLabel,
  openOrderPrint,
  resolveProductName
) {
  'use strict';

  return ListView.extend({

    className: 'orders-list is-clickable',

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
        openOrderPrint([this.$(e.currentTarget).closest('tr').attr('data-id')]);

        return false;
      }

    }, ListView.prototype.events),

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'nc12', className: 'is-min'},
      {id: 'name', className: 'is-min'},
      {id: 'mrp', className: 'is-min'},
      {id: 'qtys', className: 'is-min is-number'},
      {id: 'sapCreatedAtText', label: t.bound('orders', 'PROPERTY:sapCreatedAt'), className: 'is-min'},
      {id: 'scheduledStartDateText', label: t.bound('orders', 'PROPERTY:scheduledStartDate'), className: 'is-min'},
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

        row.name = resolveProductName(row);
        row.statusLabels = orderStatuses.findAndFill(row.statuses).map(renderOrderStatusLabel).join('');
        row.delayReason = delayReason ? delayReason.getLabel() : '';

        return row;
      });
    }

  });
});
