// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function prepareDateRange(elOrDateRange, setTime)
  {
    var dateRange = typeof elOrDateRange === 'string' ? elOrDateRange : elOrDateRange.getAttribute('data-range');
    var fromMoment = time.getMoment().minutes(0).seconds(0).milliseconds(0);
    var toMoment;
    var interval = 'day';
    var hours = fromMoment.hours();

    if (setTime)
    {
      fromMoment.hours(6);
    }

    switch (dateRange)
    {
      case 'currentYear':
        fromMoment.month(0).date(1);
        toMoment = fromMoment.clone().add(1, 'years');
        interval = 'year';
        break;

      case 'prevYear':
        fromMoment.month(0).date(1).subtract(1, 'years');
        toMoment = fromMoment.clone().add(1, 'years');
        interval = 'year';
        break;

      case 'currentQuarter':
        fromMoment.startOf('quarter');
        toMoment = fromMoment.clone().add(1, 'quarter');
        interval = 'month';
        break;

      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
        fromMoment.quarter(+dateRange.substr(1)).startOf('quarter');
        toMoment = fromMoment.clone().add(3, 'months');
        interval = 'month';
        break;

      case 'currentMonth':
        fromMoment.date(1);
        toMoment = fromMoment.clone().add(1, 'months');
        break;

      case 'prevMonth':
        fromMoment.date(1).subtract(1, 'months');
        toMoment = fromMoment.clone().add(1, 'months');
        break;

      case 'currentWeek':
        fromMoment.weekday(0);
        toMoment = fromMoment.clone().add(7, 'days');
        break;

      case 'prevWeek':
        fromMoment.weekday(0).subtract(7, 'days');
        toMoment = fromMoment.clone().add(7, 'days');
        break;

      case 'lastTwoWeeks':
        fromMoment.weekday(0).subtract(14, 'days');
        toMoment = fromMoment.clone().add(14, 'days');
        break;

      case 'today':
        toMoment = fromMoment.clone().add(1, 'days');

        if (setTime)
        {
          interval = 'shift';
        }
        break;

      case 'yesterday':
        toMoment = fromMoment.clone();
        fromMoment.subtract(1, 'days');

        if (setTime)
        {
          interval = 'shift';
        }
        break;

      case 'currentShift':
      case 'prevShift':
        if (hours >= 6 && hours < 14)
        {
          fromMoment.hours(6);
        }
        else if (hours >= 14 && hours < 22)
        {
          fromMoment.hours(14);
        }
        else
        {
          fromMoment.hours(22);

          if (hours < 6)
          {
            fromMoment.subtract(1, 'days');
          }
        }

        toMoment = fromMoment.clone().add(8, 'hours');
        interval = 'hour';

        if (dateRange === 'prevShift')
        {
          fromMoment.subtract(8, 'hours');
          toMoment.subtract(8, 'hours');
        }
        break;
    }

    if (elOrDateRange.getAttribute)
    {
      var customInterval = elOrDateRange.getAttribute('data-interval');

      if (customInterval)
      {
        interval = customInterval;
      }
    }

    return {
      fromMoment: fromMoment,
      toMoment: toMoment,
      interval: interval
    };
  };
});
