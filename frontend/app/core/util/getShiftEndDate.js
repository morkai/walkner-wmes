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

    shiftEndMoment.add('hours', 8).subtract('seconds', 1);

    return shiftEndMoment.toDate();
  };
});
