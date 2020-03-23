// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return {

    SHIFT_DURATION: 28800000,

    EMPTY_HOURLY_PLAN: [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0
    ],

    HOUR_TO_INDEX_DAY: [
      18, 19, 20, 21, 22, 23, 0, 1,
      2, 3, 4, 5, 6, 7, 8, 9,
      10, 11, 12, 13, 14, 15, 16, 17
    ],

    HOUR_TO_INDEX_SHIFT: [
      2, 3, 4, 5, 6, 7, 0, 1,
      2, 3, 4, 5, 6, 7, 0, 1,
      2, 3, 4, 5, 6, 7, 0, 1
    ],

    isActive: function(planDate)
    {
      var planMoment = time.getMoment(planDate, 'YYYY-MM-DD');
      var startTime = planMoment.hours(6).valueOf();
      var endTime = planMoment.add(24, 'hours').valueOf();
      var now = Date.now();

      return now >= startTime && now < endTime;
    },

    getShiftNo: function(time)
    {
      var h = new Date(time).getUTCHours();

      return h >= 6 && h < 14 ? 1 : h >= 14 && h < 22 ? 2 : 3;
    },

    getShiftStartTime: function(time)
    {
      var date = new Date(time);
      var h = date.getUTCHours();

      if (h >= 6 && h < 14)
      {
        date.setUTCHours(6, 0, 0, 0);
      }
      else if (h >= 14 && h < 22)
      {
        date.setUTCHours(14, 0, 0, 0);
      }
      else if (h >= 22)
      {
        date.setUTCHours(22, 0, 0, 0);
      }
      else
      {
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCHours(-2);
      }

      return date.getTime();
    },

    getShiftEndTime: function(time)
    {
      return this.getShiftStartTime(time) + this.SHIFT_DURATION;
    },

    getDateWithTime: function(timeOrDate, h, m)
    {
      var moment = time.utc.getMoment(+timeOrDate);

      if (h < 6)
      {
        moment.add(24, 'hours');
      }

      return moment.hours(h).minutes(m).valueOf();
    }

  };
});
