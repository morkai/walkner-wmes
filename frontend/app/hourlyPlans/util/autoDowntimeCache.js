// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './shift'
], function(
  shiftUtil
) {
  'use strict';

  var dateToLineDowntimes = {};

  function getLineDowntimes(prodLine, date, autoDowntimes)
  {
    var linesToDowntimes = dateToLineDowntimes[date];

    if (typeof linesToDowntimes === 'undefined')
    {
      linesToDowntimes = dateToLineDowntimes[date] = {};
    }

    var lineDowntimes = linesToDowntimes[prodLine.id];

    if (typeof lineDowntimes === 'undefined')
    {
      lineDowntimes = linesToDowntimes[prodLine.id] = cacheLineDowntimes(autoDowntimes, date);
    }

    return lineDowntimes;
  }

  function cacheLineDowntimes(autoDowntimes, date)
  {
    if (!Array.isArray(autoDowntimes) || autoDowntimes.length === 0)
    {
      return null;
    }

    var first = null;
    var current = null;

    autoDowntimes.forEach(function(autoDowntime)
    {
      if (autoDowntime.when !== 'time')
      {
        return;
      }

      autoDowntime.time.forEach(function(time)
      {
        if (!time.d)
        {
          return;
        }

        var item = {
          first: first,
          next: null,
          reason: autoDowntime.reason,
          startAt: shiftUtil.getDateWithTime(date, time.h, time.m),
          duration: time.d * 60 * 1000
        };

        if (first === null)
        {
          first = item;
        }
        else
        {
          current.next = item;
        }

        current = item;
      });
    });

    return first;
  }

  return {
    clear: function() { dateToLineDowntimes = {}; },
    get: getLineDowntimes
  };
});
