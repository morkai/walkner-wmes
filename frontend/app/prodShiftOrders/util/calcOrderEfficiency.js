// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
