// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function limitQuantityDone(view, elId, prodShiftOrderId)
  {
    view.ajax({url: '/prodSerialNumbers?limit(1)&prodShiftOrder=' + prodShiftOrderId}).done(function(res)
    {
      if (res && res.totalCount)
      {
        view.$id(elId).attr('min', res.totalCount.toString());
      }
    });
  };
});
