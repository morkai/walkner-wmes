// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function getFromTimeByInterval(interval)
  {
    /*jshint -W015*/

    var fromMoment = time.getMoment().hours(6).minutes(0).seconds(0).milliseconds(0);

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
