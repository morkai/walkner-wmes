define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/i18n'
], function(
  _,
  $,
  viewport,
  t
) {
  'use strict';

  return {
    createGetOrdersUrl: function(model, $order)
    {
      return function getOrdersUrl(term)
      {
        var type = model.getOrderIdType();

        $order.attr('data-type', type);

        return '/production/orders?' + type + '=' + encodeURIComponent(term);
      };
    },
    setUpOrderSelect2: function($order, $operation, model, options)
    {
      var helper = this;

      $order.select2(_.extend({
        openOnEnter: null,
        allowClear: false,
        minimumInputLength: 6,
        ajax: {
          cache: true,
          quietMillis: 300,
          url: helper.createGetOrdersUrl(model, $order),
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
      }, options));

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

        helper.setUpOperationSelect2($operation, operations.map(function(operation)
        {
          return {
            id: operation.no,
            text: operation.no + ' - ' + operation.name
          };
        }), options);

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
    setUpOperationSelect2: function($operation, data, options)
    {
      $operation.select2(_.extend({
        width: '100%',
        placeholder: t('production', 'newOrderPicker:online:operation:placeholder'),
        openOnEnter: null,
        allowClear: false,
        minimumResultsForSearch: -1,
        data: data || []
      }, options));
    },
    selectOrder: function($order, prodShiftOrder)
    {
      var orderId = prodShiftOrder.get('orderId');
      var orderData = prodShiftOrder.get('orderData');

      $order.select2('data', {
        id: orderId,
        text: orderId + ' - ' + (orderData.name || '?'),
        sameOrder: true
      });

      $order.trigger({
        type: 'change',
        operations: _.values(orderData.operations),
        selectedOperationNo: prodShiftOrder.get('operationNo')
      });
    }
  };
});
