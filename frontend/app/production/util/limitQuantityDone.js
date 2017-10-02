// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
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

  function validate(view)
  {
    view.$id('quantityDone').trigger('input');
  }

  return function limitQuantityDone(view, forceValidate, prodShiftOrder)
  {
    var prodShiftOrderId = prodShiftOrder.id;
    var sapOrderId = prodShiftOrder.get('orderId');

    if (!prodShiftOrderId)
    {
      return;
    }

    view.ajax({url: '/prodSerialNumbers?limit(1)&prodShiftOrder=' + prodShiftOrderId}).done(function(res)
    {
      if (res && res.totalCount)
      {
        view.$id('quantityDone').attr('min', res.totalCount.toString());

        if (forceValidate)
        {
          validate(view);
        }
      }
    });

    if (!sapOrderId || NO_MAX_CHECK_LINES[prodShiftOrder.get('prodLine')])
    {
      return;
    }

    view.ajax({url: '/orders/' + sapOrderId + '?select(qty,qtyMax,qtyDone)'}).done(function(res)
    {
      var qtyTodo = res.qty;
      var totalQtyDone = res.qtyDone ? (res.qtyDone.total || 0) : 0;
      var lineQtyDone = !res.qtyDone || !res.qtyDone.byLine
        ? 0
        : (_.findWhere(res.qtyDone.byLine, {_id: prodShiftOrder.get('prodLine')}) || {quantityDone: 0}).quantityDone;
      var psoQtyDone = prodShiftOrder.get('quantityDone');
      var qtyDone = totalQtyDone - (lineQtyDone >= psoQtyDone ? psoQtyDone : 0);
      var qtyMax = res.qtyMax || qtyTodo;
      var qtyRemaining = qtyMax - qtyDone;

      view.$id('quantityDone').attr('max', qtyRemaining);

      if (forceValidate)
      {
        validate(view);
      }
    });
  };
});
