// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/orders/util/resolveProductName',
  '../util/orderPickerHelpers',
  'app/production/templates/orderQueue',
  'app/production/templates/orderQueueRow'
], function(
  _,
  $,
  t,
  viewport,
  View,
  resolveProductName,
  orderPickerHelpers,
  template,
  renderQueueRow
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal production-orderQueueDialog',

    localTopics: {
      'socket.disconnected': 'closeDialog'
    },

    events: {
      'click #-enqueue': function()
      {
        var $order = this.$id('order');
        var $operation = this.$id('operation');
        var order = $order.select2('data');
        var operationNo = $operation.val();

        if (!order)
        {
          $order.focus();

          return;
        }

        if (!operationNo)
        {
          $operation.focus();

          return;
        }

        this.addRow(orderPickerHelpers.prepareOrderInfo(this.model, order), operationNo);

        if ($operation.hasClass('form-control'))
        {
          $operation.val('');
        }
        else
        {
          $operation.select2('val', '', true);
        }

        $order.select2('val', '', true).select2('focus');

        viewport.adjustDialogBackdrop();
      },
      'click #-clear': function()
      {
        this.$id('rows').empty();
        this.$id('queue').addClass('hidden');
        this.$id('empty').html(t('production', 'orderQueue:message:empty'));

        viewport.adjustDialogBackdrop();
      },
      'click .btn[data-action="remove"]': function(e)
      {
        this.$(e.target).closest('tr').remove();

        if (!this.$id('rows').children().length)
        {
          this.$id('queue').addClass('hidden');
          this.$id('empty').html(t('production', 'orderQueue:message:empty'));
        }

        viewport.adjustDialogBackdrop();
      },
      'click .btn[data-action="moveDown"]': function(e)
      {
        var $rows = this.$id('rows').children();
        var $row = this.$(e.target).closest('tr');
        var $next = $row.next();

        if ($rows.length === 1)
        {
          return;
        }

        if ($next.length)
        {
          $row.insertAfter($next);
        }
        else
        {
          $row.insertBefore($rows.first());
        }

        this.recountRows();
      },
      'click .btn[data-action="moveUp"]': function(e)
      {
        var $rows = this.$id('rows').children();
        var $row = this.$(e.target).closest('tr');
        var $prev = $row.prev();

        if ($rows.length === 1)
        {
          return;
        }

        if ($prev.length)
        {
          $row.insertBefore($prev);
        }
        else
        {
          $row.insertAfter($rows.last());
        }

        this.recountRows();
      },
      'click #-submit': function()
      {
        var orderCache = this.orderCache;
        var newNextOrders = [];

        this.$('tr[data-order]').each(function()
        {
          newNextOrders.push({
            order: orderCache[this.dataset.order],
            operationNo: this.dataset.operation
          });
        });

        this.model.setNextOrder(newNextOrders);

        this.closeDialog();
      }
    },

    initialize: function()
    {
      this.orderCache = {};
    },

    afterRender: function()
    {
      _.forEach(
        this.model.getNextOrders(),
        function(next) { this.addRow(next.order, next.operationNo); },
        this
      );

      this.setUpOrderSelect2();
      this.setUpOperationSelect2();
      this.focusFirstInput();

      viewport.adjustDialogBackdrop();
    },

    addRow: function(order, operationNo)
    {
      this.orderCache[order.no] = order;

      delete order.bom;
      delete order.documents;
      delete order.statusesSetAt;

      var $rows = this.$id('rows');

      $rows.append(renderQueueRow({
        no: $rows[0].childElementCount + 1,
        order: order,
        operation: order.operations[operationNo] || {no: operationNo},
        productName: resolveProductName(order)
      }));
      this.$id('empty').html(t('production', 'orderQueue:message:queue'));
      this.$id('queue').removeClass('hidden');
    },

    recountRows: function()
    {
      this.$id('rows').children().each(function(i)
      {
        this.children[0].textContent = (i + 1) + '.';
      });
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.focusFirstInput();
    },

    closeDialog: function() {},

    focusFirstInput: function()
    {
      this.$id('order').select2('focus');
    },

    setUpOrderSelect2: function()
    {
      orderPickerHelpers.setUpOrderSelect2(
        this.$id('order'),
        this.$id('operation'),
        this.model,
        {dropdownCssClass: 'production-dropdown', allowClear: true}
      );
    },

    setUpOperationSelect2: function()
    {
      orderPickerHelpers.setUpOperationSelect2(
        this.$id('operation'),
        [],
        {dropdownCssClass: 'production-dropdown'}
      );
    }

  });
});
