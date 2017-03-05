// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');

module.exports = function setUpAutoDowntimes(app, productionModule)
{
  const orgUnitsModule = app[productionModule.config.orgUnitsId];

  const currentMinute = {
    date: null,
    hours: 0,
    minutes: 0
  };
  const nextMinute = {
    date: null,
    hours: 0,
    minutes: 0
  };
  let nextMinuteInMs = Number.MAX_SAFE_INTEGER;

  app.broker.subscribe('app.started', setUpTimes).setLimit(1);

  function setUpTimes()
  {
    const minuteMoment = moment();
    const now = minuteMoment.valueOf();
    const next = minuteMoment.startOf('minute').add(1, 'minute').valueOf();

    nextMinuteInMs = next - now;

    if (nextMinuteInMs < 1000)
    {
      setTimeout(setUpTimes, nextMinuteInMs + 1);
    }
    else if (nextMinuteInMs < 10000)
    {
      setTimeout(setUpTimes, 1000);
    }
    else
    {
      setTimeout(setUpTimes, 10000);
    }

    const oldHours = currentMinute.hours;
    const oldMinutes = currentMinute.minutes;

    setUpTime(nextMinute, minuteMoment);
    setUpTime(currentMinute, minuteMoment.subtract(1, 'minute'));

    if (currentMinute.minutes !== oldMinutes || currentMinute.hours !== oldHours)
    {
      handleMinuteChange();
    }
  }

  function setUpTime(time, minuteMoment)
  {
    time.date = new Date(minuteMoment.valueOf());
    time.hours = minuteMoment.hours();
    time.minutes = minuteMoment.minutes();
  }

  function handleMinuteChange()
  {
    orgUnitsModule
      .getAllByType('subdivision')
      .forEach(subdivision => handleAutoDowntimes([subdivision._id], subdivision.autoDowntimes));

    _.forEach(
      productionModule.settings.lineAutoDowntimes,
      group => handleAutoDowntimes(group.lines, group.downtimes)
    );
  }

  function handleAutoDowntimes(orgUnits, autoDowntimes)
  {
    let currentAutoDowntime = null;
    let nextAutoDowntime = null;
    let duration = -1;

    _.forEach(autoDowntimes, function(autoDowntime)
    {
      if (autoDowntime.when !== 'time')
      {
        return;
      }

      const time = _.find(autoDowntime.time, function(t)
      {
        if (t.h === currentMinute.hours && t.m === currentMinute.minutes)
        {
          currentAutoDowntime = autoDowntime;

          return true;
        }

        if (t.h === nextMinute.hours && t.m === nextMinute.minutes)
        {
          nextAutoDowntime = autoDowntime;

          return true;
        }

        return false;
      });

      if (time)
      {
        duration = time.d;

        return false;
      }
    });

    if (duration === -1)
    {
      return;
    }

    const autoDowntime = currentAutoDowntime || nextAutoDowntime;
    const message = {
      remainingTime: -1,
      duration: duration,
      reason: autoDowntime.reason
    };

    if (nextAutoDowntime)
    {
      message.remainingTime = nextMinute.date.getTime() - Date.now();
    }

    _.forEach(orgUnits, orgUnitId => app.broker.publish(`production.autoDowntimes.${orgUnitId}`, message));

    if (nextMinuteInMs < 2000)
    {
      return;
    }

    if (nextMinuteInMs < 10000)
    {
      setTimeout(handleAutoDowntimes, 2000, orgUnits, autoDowntimes);
    }
    else
    {
      setTimeout(handleAutoDowntimes, 5000, orgUnits, autoDowntimes);
    }
  }
};
