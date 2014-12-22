// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
