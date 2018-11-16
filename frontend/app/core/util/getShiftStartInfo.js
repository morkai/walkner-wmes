// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  function getCustomShiftStartInfo(date, utc, startHour, shiftLength)
  {
    var moment = (utc ? time.utc : time).getMoment(date);
    var now = moment.valueOf();
    var shift = 1;
    var shiftCount = 24 / shiftLength;

    if (moment.hours() < startHour)
    {
      moment.subtract(24, 'hours');
    }

    moment.hours(startHour).startOf('hours');

    for (; shift <= shiftCount; ++shift)
    {
      var shiftStartTime = moment.valueOf();
      var shiftEndTime = moment.add(shiftLength, 'hours').valueOf();

      if (now >= shiftStartTime && now < shiftEndTime)
      {
        return {
          moment: moment.subtract(shiftLength, 'hours').startOf('hour'),
          no: shift,
          startTime: shiftStartTime,
          endTime: shiftEndTime,
          startHour: startHour,
          length: shiftLength,
          count: shiftCount
        };
      }
    }
  }

  return function getShiftStartInfo(date, options)
  {
    if (options)
    {
      return getCustomShiftStartInfo(
        date,
        !!options.utc,
        typeof options.startHour === 'number' ? options.startHour : 6,
        options.shiftLength || 8
      );
    }

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
        moment.subtract(1, 'days');
      }

      shift = 3;
    }

    return {
      moment: moment.startOf('minute'),
      shift: shift,
      startHour: 6,
      shiftLength: 8
    };
  };
});
