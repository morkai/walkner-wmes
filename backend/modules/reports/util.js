// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var moment = require('moment');

/**
 * @param {string} interval
 * @returns {function(number): number}
 */
exports.createCreateNextGroupKey = function(interval)
{
  var multiple = 1;

  if (interval === 'shift')
  {
    interval = 'hour';
    multiple = 8;
  }

  return function createNextGroupKey(groupKey)
  {
    return moment(groupKey).add(multiple, interval).valueOf();
  };
};

exports.createGroupKey = function(interval, date, useShifts)
{
  /*jshint -W015*/

  if (useShifts !== false)
  {
    useShifts = true;
  }

  var groupKey = moment(date);
  var hours = groupKey.hours();
  var dayOfMonth;

  groupKey.minutes(0).seconds(0).milliseconds(0);

  switch (interval)
  {
    case 'shift':
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

    case 'day':
      if (useShifts && hours < 6)
      {
        groupKey.date(groupKey.date() - 1);
      }

      groupKey.hours(0);
      break;

    case 'week':
      if (useShifts)
      {
        var weekday = groupKey.weekday();

        if (weekday === 0 && hours < 6)
        {
          groupKey.date(groupKey.date() - 1);
        }
      }

      groupKey.weekday(0).hours(0);
      break;

    case 'month':
      if (useShifts)
      {
        dayOfMonth = groupKey.date();

        if (dayOfMonth === 1 && hours < 6)
        {
          groupKey.date(dayOfMonth - 1);
        }
      }

      groupKey.date(1).hours(0);
      break;

    case 'quarter':
      dayOfMonth = groupKey.date();

      var month = groupKey.month();

      groupKey.startOf('quarter').hours(0);

      if (useShifts && dayOfMonth === 1 && hours < 6 && groupKey.month() === month)
      {
        groupKey.subtract(1, 'days').startOf('quarter');
      }
      break;

    case 'year':
      groupKey.month(0).date(1).hours(0);
      break;
  }

  return groupKey.valueOf();
};

exports.pad0 = function(num)
{
  return num >= 10 ? num : ('0' + num);
};

exports.round = function round(num)
{
  num = Math.round(num * 1000) / 1000;

  return isNaN(num) ? 0 : num;
};

exports.getCurrentShiftStartDate = function()
{
  var currentShiftStartMoment = moment().minutes(0).seconds(0).milliseconds(0);
  var currentHour = currentShiftStartMoment.hours();

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
