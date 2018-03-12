// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

function createCreateNextGroupKey(moment, interval)
{
  if (interval === 'none')
  {
    return () => Number.MAX_SAFE_INTEGER;
  }

  let multiple = 1;

  if (interval === 'shift')
  {
    interval = 'hour';
    multiple = 8;
  }

  return groupKey => moment(groupKey).add(multiple, interval).valueOf();
}

function createGroupKey(moment, interval, date, useShifts)
{
  if (useShifts !== false)
  {
    useShifts = true;
  }

  const groupKey = moment(date);
  const hours = groupKey.hours();

  groupKey.minutes(0).seconds(0).milliseconds(0);

  switch (interval)
  {
    case 'shift':
    {
      if (hours >= 6 && hours < 14)
      {
        groupKey.hours(6);
      }
      else if (hours >= 14 && hours < 22)
      {
        groupKey.hours(14);
      }
      else
      {
        groupKey.hours(22);

        if (hours < 6)
        {
          groupKey.date(groupKey.date() - 1);
        }
      }

      break;
    }

    case 'day':
    {
      if (useShifts && hours < 6)
      {
        groupKey.date(groupKey.date() - 1);
      }

      groupKey.hours(0);

      break;
    }

    case 'week':
    {
      if (useShifts)
      {
        const weekday = groupKey.weekday();

        if (weekday === 0 && hours < 6)
        {
          groupKey.date(groupKey.date() - 1);
        }
      }

      groupKey.weekday(0).hours(0);

      break;
    }

    case 'month':
    {
      if (useShifts)
      {
        const dayOfMonth = groupKey.date();

        if (dayOfMonth === 1 && hours < 6)
        {
          groupKey.date(dayOfMonth - 1);
        }
      }

      groupKey.date(1).hours(0);

      break;
    }

    case 'quarter':
    {
      const dayOfMonth = groupKey.date();
      const month = groupKey.month();

      groupKey.startOf('quarter').hours(0);

      if (useShifts && dayOfMonth === 1 && hours < 6 && groupKey.month() === month)
      {
        groupKey.subtract(1, 'days').startOf('quarter');
      }

      break;
    }

    case 'year':
      groupKey.month(0).date(1).hours(0);
      break;

    case 'none':
      return 0;
  }

  return groupKey.valueOf();
}

/**
 * @param {string} interval
 * @returns {function(number): number}
 */
exports.createCreateNextGroupKey = function(interval)
{
  return createCreateNextGroupKey(moment, interval);
};

exports.createGroupKey = function(interval, date, useShifts)
{
  return createGroupKey(moment, interval, date, useShifts);
};

exports.utc = {
  createCreateNextGroupKey: function(interval)
  {
    return createCreateNextGroupKey(moment.utc, interval);
  },
  createGroupKey: function(interval, date, useShifts)
  {
    return createGroupKey(moment.utc, interval, date, useShifts);
  }
};

exports.pad0 = function(num)
{
  return num >= 10 ? num : ('0' + num);
};

exports.round = function round(num)
{
  num = Math.round(num * 1000) / 1000;

  return isNaN(num) || !isFinite(num) ? 0 : num;
};

exports.getCurrentShiftStartDate = function()
{
  const currentShiftStartMoment = moment().minutes(0).seconds(0).milliseconds(0);
  const currentHour = currentShiftStartMoment.hours();

  if (currentHour >= 6 && currentHour < 14)
  {
    currentShiftStartMoment.hours(6);
  }
  else if (currentHour >= 14 && currentHour < 22)
  {
    currentShiftStartMoment.hours(14);
  }
  else
  {
    if (currentHour < 6)
    {
      currentShiftStartMoment.subtract(1, 'days');
    }

    currentShiftStartMoment.hours(22);
  }

  return currentShiftStartMoment.toDate();
};

exports.isIgnoredOrgUnit = function(options, doc, orgUnitType)
{
  return options.ignoredOrgUnits && options.ignoredOrgUnits[orgUnitType][doc[orgUnitType]] === true;
};

exports.getIntervalSize = function(interval)
{
  switch (interval)
  {
    case 'hour':
      return 3600 * 1000;

    case 'shift':
      return 8 * 3600 * 1000;

    case 'day':
      return 24 * 3600 * 1000;

    case 'week':
      return 7 * 24 * 3600 * 1000;

    case 'month':
      return 31 * 24 * 3600 * 1000;

    case 'quarter':
      return 3 * 31 * 24 * 3600 * 1000;

    case 'year':
      return 366 * 24 * 3600 * 1000;

    case 'none':
      return Number.MAX_SAFE_INTEGER;
  }
};

exports.getNextInterval = function(interval)
{
  switch (interval)
  {
    case 'hour':
      return 'shift';

    case 'shift':
      return 'day';

    case 'day':
      return 'week';

    case 'week':
      return 'month';

    case 'month':
      return 'quarter';

    default:
      return 'year';
  }
};
