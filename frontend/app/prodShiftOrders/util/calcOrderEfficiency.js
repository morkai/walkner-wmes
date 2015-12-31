// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function(prodShiftOrder, pretty)
  {
    var efficiency = (prodShiftOrder.laborTime / 100 * prodShiftOrder.totalQuantity)
        / (prodShiftOrder.workDuration * prodShiftOrder.workerCount);

    efficiency = isNaN(efficiency) || !isFinite(efficiency) ? 0 : efficiency;

    if (pretty)
    {
      return Math.round(efficiency * 100) + '%';
    }

    return efficiency;
  };
});
