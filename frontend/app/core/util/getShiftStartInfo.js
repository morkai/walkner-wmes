define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function getShiftStartInfo(date)
  {
    var moment = time.getMoment(date);
    var hour = moment.hour();
    var shift = -1;

    if (hour >= 6 && hour < 14)
    {
      moment.hours(6);

      shift = 1;
    }
    else if (hour >= 14 && hour < 22)
    {
      moment.hours(14);

      shift = 2;
    }
    else
    {
      moment.hours(22);

      if (hour < 6)
      {
        moment.subtract('days', 1);
      }

      shift = 3;
    }

    return {
      moment: moment.minutes(0).seconds(0).milliseconds(0),
      shift: shift
    };
  };
});
