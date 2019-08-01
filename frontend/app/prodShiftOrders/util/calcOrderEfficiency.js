// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function(prodShiftOrder, pretty)
  {
    var operation = prodShiftOrder.orderData.operations[prodShiftOrder.operationNo];
    var taktTimeCoeff = 1;

    if (operation && prodShiftOrder.orderData.taktTimeCoeff)
    {
      taktTimeCoeff = prodShiftOrder.orderData.taktTimeCoeff[operation.workCenter]
        || prodShiftOrder.orderData.taktTimeCoeff['*']
        || 1;
    }

    var efficiency = (prodShiftOrder.laborTime * taktTimeCoeff / 100 * prodShiftOrder.totalQuantity)
        / (prodShiftOrder.workDuration * prodShiftOrder.workerCount);

    efficiency = isNaN(efficiency) || !isFinite(efficiency) ? 0 : efficiency;

    if (pretty)
    {
      return Math.round(efficiency * 100) + '%';
    }

    return efficiency;
  };
});
