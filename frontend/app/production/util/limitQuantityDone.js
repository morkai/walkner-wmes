// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/socket'
], function(
  _,
  $,
  socket
) {
  'use strict';

  var NO_MAX_CHECK_LINES = {
    'W-1': true,
    'W-2': true,
    'W-3': true,
    'WB-1': true,
    'WB-2': true,
    'WB-3': true,
    'WB-4': true,
    'AV1': true,
    'AV1_P': true,
    'AV2': true,
    'AV2_P': true
  };

  return function limitQuantityDone(view, prodShiftOrder)
  {
    if (!prodShiftOrder.id || !socket.isConnected())
    {
      return;
    }

    var $submit = view.$id('submit').prop('disabled', true);
    var requests = [requestMin(view, prodShiftOrder)];

    if (prodShiftOrder.get('orderId') && !NO_MAX_CHECK_LINES[prodShiftOrder.get('prodLine')])
    {
      requests.push(requestMax(view, prodShiftOrder));
    }

    $.when.apply($, requests).always(function()
    {
      $submit.prop('disabled', false);
    });
  };

  function requestMin(view, prodShiftOrder)
  {
    var url = '/prodSerialNumbers?limit(1)&prodShiftOrder=' + prodShiftOrder.id;

    return view.ajax({url: url, timeout: 10000}).done(function(res)
    {
      if (res && res.totalCount)
      {
        minMax(view, res.totalCount, null);
      }
    });
  }

  function requestMax(view, prodShiftOrder)
  {
    var url = '/orders/' + prodShiftOrder.get('orderId') + '?select(qty,qtyMax,qtyDone)';

    return view.ajax({url: url, timeout: 10000}).done(function(res)
    {
      var operation = prodShiftOrder.getOperation() || {
        no: prodShiftOrder.get('operationNo'),
        qty: res.qty
      };

      if (!res.qtyDone)
      {
        res.qtyDone = {
          total: 0,
          byLine: {},
          byOperation: {}
        };
      }

      if (!res.qtyDone.byOperation[operation.no])
      {
        res.qtyDone.byOperation[operation.no] = 0;
      }

      if (!res.qtyMax)
      {
        res.qtyMax = {};
      }

      if (!res.qtyMax[operation.no])
      {
        res.qtyMax[operation.no] = res.qty;
      }

      var qtyDoneInPso = prodShiftOrder.get('quantityDone');
      var qtyDoneInOperation = res.qtyDone.byOperation[operation.no];
      var qtyDone = qtyDoneInOperation - (qtyDoneInOperation >= qtyDoneInPso ? qtyDoneInPso : 0);
      var qtyMax = res.qtyMax[operation.no];
      var qtyRemaining = Math.max(0, qtyMax - qtyDone);

      minMax(view, 0, qtyRemaining);
    });
  }

  function minMax(view, min, max)
  {
    var $quantityDone = view.$id('quantityDone');

    if (min !== null)
    {
      $quantityDone.attr('min', min);
    }

    if (max !== null)
    {
      $quantityDone.attr('max', max);
    }

    $quantityDone.trigger('input');
  }
});
