// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

      $order.removeClass('form-control').select2(_.assign({
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
                order.text = order._id + ' - ' + (order.description || order.name || '?');

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

      function emptyOperation(operation)
      {
        return operation.laborTime !== -1 && operation.workCenter !== '';
      }

      $order.on('change', function(e)
      {
        var operations;

        if (Array.isArray(e.operations))
        {
          operations = e.operations.filter(emptyOperation);
        }
        else if (e.added && Array.isArray(e.added.operations))
        {
          operations = e.added.operations.filter(emptyOperation);
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
        }), options, !e.removed);

        if (operations.length)
        {
          $operation
            .select2('val', e.selectedOperationNo || helper.getBestDefaultOperationNo(operations))
            .select2('focus');
        }
        else
        {
          if (e.selectedOperationNo)
          {
            $operation.val(e.selectedOperationNo);
          }

          _.defer(function() { $operation.focus(); });
        }
      });
    },
    setUpOperationSelect2: function($operation, data, options, orderPicked)
    {
      $operation.prev('.message-warning').remove();

      if (orderPicked && !data.length)
      {
        $operation
          .select2('destroy')
          .addClass('form-control')
          .val('')
          .attr('title', '');

        $('<p class="message message-inline message-warning"></p>')
          .html(t('production', 'newOrderPicker:msg:noOperations'))
          .insertBefore($operation);

        return;
      }

      $operation.removeClass('form-control').select2(_.assign({
        width: '100%',
        placeholder: ' ',
        openOnEnter: null,
        allowClear: false,
        minimumResultsForSearch: -1,
        data: data || [],
        shouldFocusInput: function() { return true; }
      }, options));
    },
    selectOrder: function($order, prodShiftOrder)
    {
      if (!prodShiftOrder)
      {
        return;
      }

      var orderId = prodShiftOrder.get('orderId');
      var orderData = prodShiftOrder.get('orderData');

      if (!orderId || !orderData)
      {
        return;
      }

      $order.select2('data', {
        id: orderId,
        text: orderId + ' - ' + (orderData.description || orderData.name || '?'),
        sameOrder: true
      });

      $order.trigger({
        type: 'change',
        operations: _.values(orderData.operations),
        selectedOperationNo: prodShiftOrder.get('operationNo')
      });
    },
    prepareOrderInfo: function(model, orderInfo)
    {
      delete orderInfo.__v;
      delete orderInfo.id;
      delete orderInfo.text;

      if (orderInfo._id)
      {
        if (model.getOrderIdType() === 'no')
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

      orderInfo.operations = this.prepareOperations(orderInfo.operations);

      return orderInfo;
    },
    prepareOperations: function(operations)
    {
      if (Array.isArray(operations))
      {
        var ops = {};

        operations.forEach(function(operation)
        {
          if (operation.workCenter === '' || operation.laborTime === -1 || ops[operation.no])
          {
            return;
          }

          ops[operation.no] = operation;
        });

        return ops;
      }
      else if (!_.isObject(operations))
      {
        return {};
      }

      return operations;
    },
    getBestDefaultOperationNo: function(operations)
    {
      var operation = this.getBestDefaultOperation(operations);

      return operation ? operation.no : null;
    },
    getBestDefaultOperation: function(operations)
    {
      if (!Array.isArray(operations) || operations.length === 0)
      {
        return null;
      }

      if (operations.length === 1)
      {
        return operations[0];
      }

      return operations
        .map(function(op)
        {
          var rank = 0;

          if (op.laborTime > 0)
          {
            rank += 1;
          }

          if (op.workCenter)
          {
            rank += 1;
          }

          if (/^monta/i.test(op.name))
          {
            rank += 1;
          }

          if (/monta/i.test(op.name))
          {
            rank += 2;
          }

          if (/g..wn/i.test(op.name))
          {
            rank += 1;
          }

          if (/pak/i.test(op.name))
          {
            rank += 1;
          }

          if (/kj/i.test(op.name))
          {
            rank += 1;
          }

          if (/opra/i.test(op.name))
          {
            rank += 1;
          }

          if (/z.o.en/i.test(op.name))
          {
            rank += 1;
          }

          return {
            op: op,
            rank: rank
          };
        })
        .sort(function(a, b) { return b.rank - a.rank; })
        .shift()
        .op;
    }
  };
});
