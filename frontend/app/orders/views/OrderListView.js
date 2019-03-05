// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/data/orderStatuses',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/printers/views/PrinterPickerView',
  '../util/openOrderPrint'
], function(
  _,
  t,
  user,
  ListView,
  orderStatuses,
  renderOrderStatusLabel,
  PrinterPickerView,
  openOrderPrint
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

    events: _.assign({

      'click .action-print': function(e)
      {
        var orderNo = this.$(e.currentTarget).closest('tr').attr('data-id');

        e.listAction = {
          view: this,
          tag: 'orders'
        };

        PrinterPickerView.listAction(e, function(printer)
        {
          openOrderPrint([orderNo], printer);
        });

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
      {id: 'm4', className: 'is-min'},
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
      var options = {delayReasons: this.delayReasons};

      return this.collection.map(function(model)
      {
        return model.serialize(options);
      });
    }

  });
});
