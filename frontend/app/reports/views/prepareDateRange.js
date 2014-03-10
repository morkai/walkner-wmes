define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function prepareDateRange(dateRange, setTime)
  {
    /*jshint -W015*/

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
      case 'currentMonth':
        fromMoment.date(1);
        toMoment = fromMoment.clone().add('months', 1);
        break;

      case 'prevMonth':
        fromMoment.date(1).subtract('months', 1);
        toMoment = fromMoment.clone().add('months', 1);
        break;

      case 'currentWeek':
        fromMoment.weekday(0);
        toMoment = fromMoment.clone().add('days', 7);
        break;

      case 'prevWeek':
        fromMoment.weekday(0).subtract('days', 7);
        toMoment = fromMoment.clone().add('days', 7);
        break;

      case 'today':
        toMoment = fromMoment.clone().add('days', 1);

        if (setTime)
        {
          interval = 'shift';
        }
        break;

      case 'yesterday':
        toMoment = fromMoment.clone();
        fromMoment.subtract('days', 1);

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
            fromMoment.subtract('days', 1);
          }
        }

        toMoment = fromMoment.clone().add('hours', 8);
        interval = 'hour';

        if (dateRange === 'prevShift')
        {
          fromMoment.subtract('hours', 8);
          toMoment.subtract('hours', 8);
        }
        break;
    }

    return {
      fromMoment: fromMoment,
      toMoment: toMoment,
      interval: interval
    };
  };
});
