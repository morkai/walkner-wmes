// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(['./shift'], function(shiftUtil)
{
  'use strict';

  var dateToSubdivisionsToDowntimes = {};

  function getSubdivisionDowntimes(subdivision, date)
  {
    var subdivisionsToDowntimes = dateToSubdivisionsToDowntimes[date];

    if (typeof subdivisionsToDowntimes === 'undefined')
    {
      subdivisionsToDowntimes = dateToSubdivisionsToDowntimes[date] = {};
    }

    var downtimes = subdivisionsToDowntimes[subdivision.id];

    if (typeof downtimes === 'undefined')
    {
      downtimes = subdivisionsToDowntimes[subdivision.id] = cacheSubdivisionDowntimes(subdivision, date);
    }

    return downtimes;
  }

  function cacheSubdivisionDowntimes(subdivision, date)
  {
    var autoDowntimes = subdivision.get('autoDowntimes');

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

    get: getSubdivisionDowntimes

  };
});
