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
        offline: !this.socket.isConnected()
      };
    },

    afterRender: function()
    {
      if (this.socket.isConnected())
      {
        this.setUpOrderSelect2();
        this.setUpOperationSelect2();

        this.$id('order').select2('focus');
      }
      else
      {
        this.$id('order').focus();
      }
    },

    onDialogShown: function()
    {
      this.$id('order').focus().select2('focus');
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
          results: function(data)
          {
            return {
              results: (data.collection || []).map(function(order)
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
      var url;

      if (/^114/.test(term))
      {
        url = '/orders?exclude(changes,importTs)&sort(_id)&limit(20)';

        if (term.length === 9)
        {
          url += '&_id=' + encodeURIComponent(term);
        }
        else
        {
          url += '&regex(_id,' + encodeURIComponent('^' + term) + ')';
        }

        this.$id('order').attr('data-type', 'no');
      }
      else
      {
        url = '/mechOrders?sort(_id)&limit(20)';

        if (/^[0-9]+$/.test(term) && term.length === 12)
        {
          url += '&_id=' + encodeURIComponent(term);
        }
        else
        {
          url += '&regex(_id,' + encodeURIComponent('^' + term) + ')';
        }

        this.$id('order').attr('data-type', 'nc12');
      }

      return url;
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

      this.trigger('orderPicked', orderInfo, operationNo);
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

      this.trigger('orderPicked', orderInfo, operationNo);
    }

  });
});
