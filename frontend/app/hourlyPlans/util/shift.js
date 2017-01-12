// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(['app/time'], function(time)
{
  'use strict';

  return {

    SHIFT_DURATION: 28800000,

    EMPTY_HOURLY_PLAN: [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0
    ],

    HOUR_TO_INDEX: [
      18, 19, 20, 21, 22, 23, 0, 1,
      2, 3, 4, 5, 6, 7, 8, 9,
      10, 11, 12, 13, 14, 15, 16, 17
    ],

    getShiftNo: function(time)
    {
      var h = new Date(this.getShiftStartTime(time)).getHours();

      return h === 6 ? 1 : h === 14 ? 2 : 3;
    },

    getShiftStartTime: function(time)
    {
      var date = new Date(time);
      var h = date.getHours();

      if (h >= 6 && h < 14)
      {
        date.setHours(6, 0, 0, 0);
      }
      else if (h >= 14 && h < 22)
      {
        date.setHours(14, 0, 0, 0);
      }
      else if (h >= 22)
      {
        date.setHours(22, 0, 0, 0);
      }
      else
      {
        date.setHours(0, 0, 0, 0);
        date.setHours(-2);
      }

      return date.getTime();
    },

    getShiftEndTime: function(time)
    {
      return this.getShiftStartTime(time) + this.SHIFT_DURATION;
    },

    getDateWithTime: function(timeOrDate, h, m)
    {
      var moment = time.getMoment(+timeOrDate);

      if (h < 6)
      {
        moment.add(24, 'hours');
      }

      return moment.hours(h).minutes(m).valueOf();
    }

  };
});
