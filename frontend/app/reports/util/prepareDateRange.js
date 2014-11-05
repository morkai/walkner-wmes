// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    return {
      fromMoment: fromMoment,
      toMoment: toMoment,
      interval: interval
    };
  };
});
