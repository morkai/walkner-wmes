define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  '../util/orderPickerHelpers',
  'app/production/templates/newOrderPicker'
], function(
  _,
  $,
  t,
  viewport,
  View,
  orderPickerHelpers,
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
      orderPickerHelpers.setUpOrderSelect2(
        this.$id('order').removeClass('form-control'),
        this.$id('operation'),
        this.model,
        {dropdownCssClass: 'production-dropdown'}
      );
    },

    setUpOperationSelect2: function()
    {
      var $operation = this.$id('operation').attr('placeholder', null).removeClass('form-control');

      orderPickerHelpers.setUpOperationSelect2(
        $operation,
        [],
        {dropdownCssClass: 'production-dropdown'}
      );
    },

    selectCurrentOrder: function()
    {
      orderPickerHelpers.selectOrder(this.$id('order'), this.model.prodShiftOrder);
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
        orderPickerHelpers.prepareOrderInfo(this.model, orderInfo);
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
