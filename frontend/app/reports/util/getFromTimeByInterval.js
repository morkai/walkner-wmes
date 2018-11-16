// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function getFromTimeByInterval(interval)
  {
    var fromMoment = time.getMoment().hours(6).startOf('hour');

    switch (interval)
    {
      case 'year':
      case 'quarter':
      case 'month':
      case 'week':
        fromMoment.startOf(interval);
        break;
    }

    return fromMoment.valueOf();
  };
});
