// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function getShiftEndDate(date, shift)
  {
    var shiftEndMoment = time.getMoment(date);

    if (shift === 1)
    {
      shiftEndMoment.hours(6);
    }
    else if (shift === 2)
    {
      shiftEndMoment.hours(14);
    }
    else
    {
      shiftEndMoment.hours(22);
    }

    shiftEndMoment.add(8, 'hours').subtract(1, 'seconds');

    return shiftEndMoment.toDate();
  };
});
