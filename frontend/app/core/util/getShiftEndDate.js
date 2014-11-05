// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
