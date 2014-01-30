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

        if (this.socket.isConnected())
        {
          this.handleOnlinePick();
        }
        else
        {
          this.handleOfflinePick();
        }
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('newOrderPicker');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        offline: !this.socket.isConnected(),
        replacingOrder: this.model.hasOrder(),
        quantityDone: this.model.prodShiftOrder.get('quantityDone') || 0,
        workerCount: this.model.prodShiftOrder.get('workerCount') || 0
      };
    },

    afterRender: function()
    {
      if (this.socket.isConnected())
      {
        this.setUpOrderSelect2();
        this.setUpOperationSelect2();
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
      if (this.model.hasOrder())
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
        minimumInputLength: 3,
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

      $order.on('change', function(e)
      {
        var operations = e.added && Array.isArray(e.added.operations) ? e.added.operations : [];

        var $operation = view.setUpOperationSelect2(operations.map(function(operation)
        {
          return {
            id: operation.no,
            text: operation.no + ' - ' + operation.name
          };
        }));

        if (operations.length)
        {
          $operation.select2('val', operations[0].no).select2('focus');
        }
        else
        {
          _.defer(function() { $order.select2('focus'); });
        }
      });
    },

    getOrdersUrl: function(term)
    {
      var type = /^114[0-9]{0,6}/.test(term) ? 'no' : 'nc12';

      this.$id('order').attr('data-type', type);

      return '/production/orders?' + type + '=' + encodeURIComponent(term);
    },

    setUpOperationSelect2: function(data)
    {
      var $operation = this.$id('operation').attr('placeholder', null).removeClass('form-control');

      $operation.select2({
        dropdownCssClass: 'production-dropdown',
        placeholder: t('production', 'newOrderPicker:online:operation:placeholder'),
        openOnEnter: null,
        allowClear: false,
        data: data || []
      });

      return $operation;
    },

    handleOnlinePick: function()
    {
      var orderInfo = this.$id('order').select2('data');
      var operationNo = this.$id('operation').select2('val');

      if (!orderInfo)
      {
        this.$id('order').select2('focus');

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('production', 'newOrderPicker:msg:emptyOrder')
        });
      }

      if (!operationNo)
      {
        this.$id('order').select2('focus');

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('production', 'newOrderPicker:msg:emptyOperation')
        });
      }

      delete orderInfo.__v;
      delete orderInfo.id;
      delete orderInfo.text;

      if (/^114[0-9]{6}$/.test(orderInfo._id))
      {
        orderInfo.no = orderInfo._id;
      }
      else
      {
        orderInfo.no = null;
        orderInfo.nc12 = orderInfo._id;
      }

      delete orderInfo._id;

      this.pickOrder(orderInfo, operationNo);
    },

    handleOfflinePick: function()
    {
      var orderInfo = {
        no: null,
        nc12: null
      };

      var orderNoOrNc12 = this.$id('order').val().trim().replace(/[^a-zA-Z0-9]+/g, '');
      var operationNo = this.$id('operation').val().trim().replace(/[^0-9]+/g, '');

      if (/^114[0-9]{6}$/.test(orderNoOrNc12))
      {
        orderInfo.no = orderNoOrNc12;
      }
      else if (orderNoOrNc12.length === 12
        || (orderNoOrNc12.length < 9 && /^[a-zA-Z]+[a-zA-Z0-9]*$/.test(orderNoOrNc12)))
      {
        orderInfo.nc12 = orderNoOrNc12;
      }
      else
      {
        this.$id('order').select();

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t(
            'production',
            orderNoOrNc12 === ''
              ? 'newOrderPicker:msg:emptyOrder'
              : 'newOrderPicker:msg:invalidOrderOrNc12'
          )
        });
      }

      if (!/^[0-9]{1,4}$/.test(operationNo))
      {
        this.$id('operation').select();

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
      if (this.model.hasOrder())
      {
        var newQuantityDone = this.parseInt('quantityDone');
        var newWorkerCount = this.parseInt('workerCount');

        if (newQuantityDone !== this.model.prodShiftOrder.get('quantityDone'))
        {
          this.model.changeQuantityDone(newQuantityDone);
        }

        if (newWorkerCount !== this.model.prodShiftOrder.get('workerCount'))
        {
          this.model.changeWorkerCount(newWorkerCount);
        }
      }

      this.model.changeOrder(orderInfo, operationNo);

      this.closeDialog();
    },

    parseInt: function(field)
    {
      var value = parseInt(this.$id(field).val(), 10);

      return isNaN(value) || value < 0 ? 0 : value;
    }

  });
});
