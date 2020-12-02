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

    serializeColumns: function()
    {
      return [
        {id: '_id', className: 'is-min'},
        {id: 'nc12', className: 'is-min'},
        {
          id: 'name',
          titleProperty: function(row)
          {
            return /^[A-Z]/.test(row.nc12) && row.name ? 'name' : 'description';
          },
          className: 'is-min',
          tdDecorator: function(columnId, value, row)
          {
            var name = [];

            if (row.etoCont)
            {
              name.push('<span class="label label-default orders-tag">EK</span>');
            }
            else if (row.priority === 'E')
            {
              name.push('<span class="label label-default orders-tag">E</span>');
            }

            (row.tags || []).forEach(function(tag)
            {
              name.push(
                '<span class="label label-default orders-tag" title="' + _.escape(tag.label) + '">'
                + _.escape(tag._id)
                + '</span>'
              );
            });

            if (row.description && row.name !== row.description)
            {
              name.push('<i class="fa fa-question-circle"></i>');
            }

            name.push(/^[A-Z]/.test(row.nc12) && row.description ? row.description : row.name);

            return name.join(' ');
          }
        },
        {id: 'mrp', className: 'is-min'},
        {id: 'qtys', className: 'is-min is-number'},
        {id: 'sapCreatedAt', valueProperty: 'sapCreatedAtText', className: 'is-min'},
        {id: 'scheduledStartDate', valueProperty: 'scheduledStartDateText', className: 'is-min'},
        {id: 'delayReason', className: 'is-min'},
        {id: 'm4', className: 'is-min'},
        {id: 'statuses', valueProperty: 'statusLabels'}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;
      var isUser = user.isAllowedTo('USER');

      return function(row)
      {
        var actions = [ListView.actions.viewDetails(collection.get(row._id))];

        if (isUser)
        {
          actions.push({
            id: 'print',
            icon: 'print',
            label: t.bound('orders', 'LIST:ACTION:print'),
            href: '/orders/' + row._id + '.html?print'
          });
        }

        return actions;
      };
    },

    serializeRows: function()
    {
      var options = {delayReasons: this.delayReasons};

      return this.collection.map(function(model)
      {
        return model.serialize(options);
      });
    },

    onReset: function()
    {
      var hidden = this.$el.hasClass('hidden');

      this.render();

      if (hidden !== this.$el.hasClass('hidden'))
      {
        this.model.trigger('panelToggle');
      }
    }

  });
});
