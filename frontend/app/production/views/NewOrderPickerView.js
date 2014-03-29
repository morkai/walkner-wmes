define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/production/templates/newOrderPicker'
], function(
  _,
  $,
  t,
  viewport,
  View,
  personelPickerTemplate
) {
  'use strict';

  return View.extend({

    template: personelPickerTemplate,

    dialogClassName: function()
    {
      var className = 'production-modal production-newOrderPickerDialog';

      if (this.options.correctingOrder)
      {
        className += ' is-correcting';
      }
      else if (this.model.hasOrder())
      {
        className += ' is-replacing';
      }

      return className;
    },

    localTopics: {
      'socket.connected': 'render',
      'socket.disconnected': 'render'
    },

    events: {
      'keypress .select2-container': function(e)
      {
        if (e.which === 13)
        {
          this.$el.submit();

          e.preventDefault();
        }
      },
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$('button[type=submit]')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        if (this.socket.isConnected())
        {
          this.handleOnlinePick(submitEl);
        }
        else
        {
          this.handleOfflinePick(submitEl);
        }
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('newOrderPicker');
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        offline: !this.socket.isConnected(),
        replacingOrder: !this.options.correctingOrder && this.model.hasOrder(),
        correctingOrder: !!this.options.correctingOrder,
        quantityDone: this.model.prodShiftOrder.get('quantityDone') || 0,
        workerCount: this.model.prodShiftOrder.getWorkerCountForEdit(),
        orderIdType: this.model.getOrderIdType(),
        maxQuantityDone: this.model.prodShiftOrder.getMaxQuantityDone(),
        maxWorkerCount: this.model.prodShiftOrder.getMaxWorkerCount()
      };
    },

    afterRender: function()
    {
      if (this.socket.isConnected())
      {
        this.setUpOrderSelect2();
        this.setUpOperationSelect2();

        if (this.options.correctingOrder)
        {
          this.selectCurrentOrder();
        }
      }
      else if (this.options.correctingOrder)
      {
        this.$id('order').val(this.model.prodShiftOrder.get('orderId'));
        this.$id('operation').val(this.model.prodShiftOrder.get('operationNo'));
      }

      this.focusFirstInput();
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.focusFirstInput();
    },

    closeDialog: function() {},

    focusFirstInput: function()
    {
      if (!this.options.correctingOrder && this.model.hasOrder())
      {
        this.$id('quantityDone').select();
      }
      else if (this.socket.isConnected())
      {
        this.$id('order').select2('focus');
      }
      else
      {
        this.$id('order').select();
      }
    },

    setUpOrderSelect2: function()
    {
      var view = this;
      var $order = this.$id('order').removeClass('form-control');

      $order.select2({
        dropdownCssClass: 'production-dropdown',
        openOnEnter: null,
        allowClear: true,
        minimumInputLength: 6,
        ajax: {
          cache: true,
          quietMillis: 500,
          url: this.getOrdersUrl.bind(this),
          results: function(results)
          {
            return {
              results: (Array.isArray(results) ? results : []).map(function(order)
              {
                order.id = order._id;
                order.text = order._id + ' - ' + (order.name || '?');

                return order;
              })
            };
          },
          transport: function(options)
          {
            return $.ajax.apply($, arguments).fail(function()
            {
              viewport.msg.show({
                type: 'error',
                time: 2000,
                text: t('production', 'newOrderPicker:msg:searchFailure')
              });

              options.success({collection: []});
            });
          }
        }
      });

      function withLaborTime(operation)
      {
        return operation.laborTime !== -1;
      }

      $order.on('change', function(e)
      {
        var operations;

        if (Array.isArray(e.operations))
        {
          operations = e.operations.filter(withLaborTime);
        }
        else if (e.added && Array.isArray(e.added.operations))
        {
          operations = e.added.operations.filter(withLaborTime);
        }
        else
        {
          operations = [];
        }

        var $operation = view.setUpOperationSelect2(operations.map(function(operation)
        {
          return {
            id: operation.no,
            text: operation.no + ' - ' + operation.name
          };
        }));

        if (operations.length)
        {
          $operation.select2('val', e.selectedOperationNo || operations[0].no).select2('focus');
        }
        else
        {
          _.defer(function() { $order.select2('focus'); });
        }
      });
    },

    getOrdersUrl: function(term)
    {
      var type = this.model.getOrderIdType();

      this.$id('order').attr('data-type', type);

      return '/production/orders?' + type + '=' + encodeURIComponent(term);
    },

    setUpOperationSelect2: function(data)
    {
      var $operation = this.$id('operation').attr('placeholder', null).removeClass('form-control');

      $operation.select2({
        width: '100%',
        dropdownCssClass: 'production-dropdown',
        placeholder: t('production', 'newOrderPicker:online:operation:placeholder'),
        openOnEnter: null,
        allowClear: false,
        data: data || []
      });

      return $operation;
    },

    selectCurrentOrder: function()
    {
      var orderId = this.model.prodShiftOrder.get('orderId');
      var orderData = this.model.prodShiftOrder.get('orderData');
      var $order = this.$id('order');

      $order.select2('data', {
        id: orderId,
        text: orderId + ' - ' + (orderData.name || '?'),
        sameOrder: true
      });

      $order.trigger({
        type: 'change',
        operations: _.values(orderData.operations),
        selectedOperationNo: this.model.prodShiftOrder.get('operationNo')
      });
    },

    handleOnlinePick: function(submitEl)
    {
      var orderInfo = this.$id('order').select2('data');
      var operationNo = this.$id('operation').select2('val');

      if (!orderInfo)
      {
        this.$id('order').select2('focus');

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('production', 'newOrderPicker:msg:emptyOrder')
        });
      }

      if (!operationNo)
      {
        this.$id('order').select2('focus');

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('production', 'newOrderPicker:msg:emptyOperation')
        });
      }

      if (orderInfo.sameOrder)
      {
        orderInfo = this.model.prodShiftOrder.get('orderData');
      }
      else
      {
        delete orderInfo.__v;
        delete orderInfo.id;
        delete orderInfo.text;

        if (this.model.getOrderIdType() === 'no')
        {
          orderInfo.no = orderInfo._id;
        }
        else
        {
          orderInfo.no = null;
          orderInfo.nc12 = orderInfo._id;
        }

        delete orderInfo._id;
      }

      this.pickOrder(orderInfo, operationNo);
    },

    handleOfflinePick: function(submitEl)
    {
      var orderIdType = this.model.getOrderIdType();
      var orderInfo = {
        no: null,
        nc12: null
      };

      var orderNoOrNc12 = this.$id('order').val().trim().replace(/[^a-zA-Z0-9]+/g, '');
      var operationNo = this.$id('operation').val().trim().replace(/[^0-9]+/g, '');

      if (orderIdType === 'no' && /^[0-9]{9,}$/.test(orderNoOrNc12))
      {
        orderInfo.no = orderNoOrNc12;
      }
      else if (orderIdType === 'nc12'
        && (orderNoOrNc12.length === 12
        || (orderNoOrNc12.length < 9 && /^[a-zA-Z]+[a-zA-Z0-9]*$/.test(orderNoOrNc12))))
      {
        orderInfo.nc12 = orderNoOrNc12;
      }
      else
      {
        this.$id('order').select();

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t(
            'production',
            orderNoOrNc12 === ''
              ? 'newOrderPicker:msg:emptyOrder'
              : ('newOrderPicker:msg:invalidOrderId:' + orderIdType)
          )
        });
      }

      if (!/^[0-9]{1,4}$/.test(operationNo))
      {
        this.$id('operation').select();

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t(
            'production',
            orderNoOrNc12 === ''
              ? 'newOrderPicker:msg:emptyOrder'
              : 'newOrderPicker:msg:invalidOperationNo'
          )
        });
      }

      while (operationNo.length < 4)
      {
        operationNo = '0' + operationNo;
      }

      this.pickOrder(orderInfo, operationNo);
    },

    pickOrder: function(orderInfo, operationNo)
    {
      if (!this.options.correctingOrder && this.model.hasOrder())
      {
        this.model.changeQuantityDone(this.parseInt('quantityDone'));
        this.model.changeWorkerCount(this.parseInt('workerCount'));
      }

      if (this.options.correctingOrder)
      {
        this.model.correctOrder(orderInfo, operationNo);
      }
      else
      {
        this.model.changeOrder(orderInfo, operationNo);
      }

      this.closeDialog();
    },

    parseInt: function(field)
    {
      var value = parseInt(this.$id(field).val(), 10);

      return isNaN(value) || value < 0 ? 0 : value;
    }

  });
});
