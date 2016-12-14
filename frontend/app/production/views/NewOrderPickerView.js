// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  template
) {
  'use strict';

  return View.extend({

    template: template,

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

          return false;
        }
      },
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$id('submit')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var $nc12 = this.$id('spigot-nc12');

        if ($nc12.length)
        {
          var matches = $nc12.val().match(/([0-9]{12})/);
          var nc12 = matches ? matches[1] : '';

          if (!nc12.length || !this.model.checkSpigot(null, nc12))
          {
            $nc12[0].setCustomValidity(t('production', 'newOrderPicker:spigot:invalid'));

            this.timers.submit = setTimeout(
              function()
              {
                submitEl.disabled = false;
                submitEl.click();
              },
              1,
              this
            );

            return;
          }
        }

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
      this.lastKeyPressAt = 0;

      $(window)
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
        .on('keypress.' + this.idPrefix, this.onKeyPress.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    serialize: function()
    {
      var shift = this.model;
      var order = shift.prodShiftOrder;

      return {
        idPrefix: this.idPrefix,
        spigot: shift.settings.getValue('spigotFinish') && !!order.get('spigot'),
        offline: !this.socket.isConnected(),
        replacingOrder: !this.options.correctingOrder && shift.hasOrder(),
        correctingOrder: !!this.options.correctingOrder,
        quantityDone: order.get('quantityDone') || 0,
        workerCount: order.getWorkerCountForEdit(),
        orderIdType: shift.getOrderIdType(),
        maxQuantityDone: order.getMaxQuantityDone(),
        maxWorkerCount: order.getMaxWorkerCount()
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
        else
        {
          this.selectNextOrder();
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
      var $nc12 = this.$id('spigot-nc12');

      if ($nc12.length)
      {
        $nc12.focus();
      }
      else if (!this.options.correctingOrder && this.model.hasOrder())
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
        this.$id('order'),
        this.$id('operation'),
        this.model,
        {dropdownCssClass: 'production-dropdown'}
      );
    },

    setUpOperationSelect2: function()
    {
      orderPickerHelpers.setUpOperationSelect2(
        this.$id('operation'),
        [],
        {dropdownCssClass: 'production-dropdown'}
      );
    },

    selectCurrentOrder: function()
    {
      orderPickerHelpers.selectOrder(this.$id('order'), this.model.prodShiftOrder);
    },

    selectNextOrder: function()
    {
      var nextOrders = this.model.get('nextOrder');

      if (_.isEmpty(nextOrders))
      {
        return;
      }

      var next = nextOrders[0];
      var order = next.order;
      var $order = this.$id('order');

      $order.select2('data', _.assign({}, order, {
        id: order.no,
        text: order.no + ' - ' + (order.description || order.name || '?'),
        sameOrder: false
      }));

      $order.trigger({
        type: 'change',
        operations: _.values(order.operations),
        selectedOperationNo: next.operationNo
      });
    },

    handleOnlinePick: function(submitEl)
    {
      var orderInfo = this.$id('order').select2('data');
      var $operation = this.$id('operation');
      var operationNo = $operation.hasClass('form-control') ? $operation.val() : this.$id('operation').select2('val');

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
        $operation.focus();

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

      this.pickOrder(orderInfo, operationNo);
    },

    pickOrder: function(orderInfo, operationNo)
    {
      while (operationNo.length < 4)
      {
        operationNo = '0' + operationNo;
      }

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
    },

    isIgnoredTarget: function(target)
    {
      return target.type === 'number'
        || target.className.indexOf('select2') !== -1
        || target.dataset.ignoreKey === '1';
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 8 && !this.isIgnoredTarget(e.target))
      {
        this.lastKeyPressAt = Date.now();

        this.$id('spigot-nc12').val('')[0].setCustomValidity('');

        return false;
      }
    },

    onKeyPress: function(e)
    {
      var $nc12 = this.$id('spigot-nc12');
      var target = e.target;
      var keyCode = e.keyCode;

      if (keyCode === 13)
      {
        return $nc12[0] !== target;
      }

      if (keyCode < 32 || keyCode > 126 || this.isIgnoredTarget(target))
      {
        return;
      }

      var keyPressAt = Date.now();
      var prevValue = keyPressAt - this.lastKeyPressAt > 333 ? '' : $nc12.val();
      var key = String.fromCharCode(keyCode);

      $nc12.val(prevValue + key)[0].setCustomValidity('');
      $nc12.focus();

      this.lastKeyPressAt = keyPressAt;

      return false;
    }

  });
});
