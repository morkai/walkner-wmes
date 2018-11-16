// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function getShiftStartInfo(date, options)
  {
    var shiftLength = options && options.shiftLength || 8;
    var startHour = options && typeof options.startHour === 'number' ? options.startHour : 6;
    var moment = (options && options.utc ? time.utc : time).getMoment(date);
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

    throw new Error('Could resolve the shift start info!');
  };
});
