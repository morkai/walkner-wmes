'use strict';

var _ = require('lodash');
var moment = require('moment');

exports.holidays = {};

exports.years = {};

exports.quarters = {};

exports.months = {};

exports.countBetweenDates = function(fromTime, toTime)
{
  var businessDays = 0;

  if (fromTime >= toTime)
  {
    return businessDays;
  }

  var fromMoment = moment(fromTime);

  while (fromMoment.valueOf() < toTime)
  {
    businessDays += exports.countInDay(fromMoment.toDate());

    fromMoment.add(1, 'days');
  }

  return businessDays;
};

exports.countInDay = function(date)
{
  if (exports.holidays[date.getTime()])
  {
    return 0;
  }

  var weekDay = date.getDay();

  return weekDay === 0 || weekDay === 6 ? 0 : 1;
};

exports.countInWeek = function(date, currentShiftStartDate)
{
  if (date > currentShiftStartDate)
  {
    return -1;
  }

  var currentShiftStartTime = currentShiftStartDate.getTime();
  var dateMoment = moment(date);
  var businessDays = 0;

  for (var i = 0; i < 5; ++i)
  {
    var time = dateMoment.valueOf();

    if (time > currentShiftStartTime)
    {
      break;
    }

    if (!exports.holidays[time])
    {
      businessDays += 1;
    }

    dateMoment.add(1, 'days');
  }

  return businessDays;
};

exports.countInMonth = function(date, currentShiftStartDate)
{
  if (date > currentShiftStartDate)
  {
    return -1;
  }

  var currentDay = currentShiftStartDate.getDate();
  var currentMonth = currentShiftStartDate.getMonth();
  var currentYear = currentShiftStartDate.getFullYear();
  var key = date.getTime().toString();
  var businessDays = exports.months[key];
  var weekDay;

  if (!businessDays)
  {
    businessDays = 0;

    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var sameMonth = year === currentYear && month === currentMonth;

    while (date.getMonth() === month)
    {
      weekDay = date.getDay();

      if (weekDay !== 0 && weekDay !== 6)
      {
        ++businessDays;
      }

      if (sameMonth && day === currentDay)
      {
        break;
      }

      date.setDate(++day);
    }

    return businessDays;
  }

  if (currentShiftStartDate.getFullYear() === date.getFullYear()
    && currentShiftStartDate.getMonth() === date.getMonth())
  {
    businessDays = 0;

    while (date.getDate() <= currentDay)
    {
      weekDay = date.getDay();

      if (weekDay !== 0 && weekDay !== 6 && !exports.holidays[date.getTime()])
      {
        ++businessDays;
      }

      date.setDate(date.getDate() + 1);
    }
  }

  return businessDays;
};

exports.countInQuarter = function(date, currentShiftStartDate)
{
  if (date > currentShiftStartDate)
  {
    return -1;
  }

  var businessDays = exports.quarters[date.getTime()];
  var quarterMoment = moment(date);

  if (businessDays !== undefined
    && quarterMoment.year() !== currentShiftStartDate.getFullYear()
    && quarterMoment.quarter() !== moment(currentShiftStartDate).quarter())
  {
    return businessDays;
  }

  businessDays = 0;

  for (var i = 0; i < 3; ++i)
  {
    businessDays += exports.countInMonth(quarterMoment.toDate(), currentShiftStartDate);

    quarterMoment.add(1, 'months');
  }

  return businessDays;
};

exports.countInYear = function(date, currentShiftStartDate)
{
  if (date > currentShiftStartDate)
  {
    return -1;
  }

  if (date.getFullYear() !== currentShiftStartDate.getFullYear())
  {
    return exports.years[date.getTime()] || 250;
  }

  var businessDays = 0;
  var dateMoment = moment(date);

  for (var m = 0, month = currentShiftStartDate.getMonth(); m <= month; ++m)
  {
    businessDays += exports.countInMonth(
      dateMoment.clone().month(m).toDate(),
      currentShiftStartDate
    );
  }

  return businessDays;
};

addYear(
  2013,
  [
    [22, 1, 6],
    20,
    [21, 31],
    [21, 1],
    [20, 1, 3, 19, 30],
    20,
    23,
    [21, 15],
    21,
    23,
    [19, 1, 11],
    [20, 25, 26]
  ]
);

addYear(
  2014,
  [
    [21, 1, 6],
    20,
    21,
    [21, 20, 21],
    [21, 1, 3],
    [20, 8, 19],
    23,
    [20, 15],
    22,
    23,
    [19, 1, 11],
    [21, 25, 26]
  ]
);

addYear(
  2015,
  [
    [20, 1, 6],
    20,
    22,
    [21, 5, 6],
    [20, 1, 3, 24],
    [21, 4],
    23,
    [21, 15],
    22,
    22,
    [20, 1, 11],
    [22, 25, 26]
  ]
);

addYear(
  2016,
  [
    [19, 1, 6],
    21,
    [22, 27, 28],
    21,
    [20, 1, 3, 15, 26],
    22,
    21,
    [22, 15],
    22,
    21,
    [20, 1, 11],
    [21, 25, 26]
  ]
);

addYear(
  2017,
  [
    [21, 1, 6],
    20,
    23,
    [19, 16, 17],
    [21, 1, 3],
    [21, 4, 15],
    21,
    [22, 15],
    21,
    22,
    [21, 1, 11],
    [19, 25, 26]
  ]
);

addYear(
  2018,
  [
    [22, 1, 6],
    20,
    22,
    [20, 1, 2],
    [20, 1, 3, 20, 31],
    21,
    22,
    [22, 15],
    20,
    23,
    [21, 1, 11],
    [19, 25, 26]
  ]
);

function addYear(year, months)
{
  var businessDaysInYear = 0;
  var quarterKey;

  _.forEach(months, function(days, month)
  {
    var businessDaysInMonth;

    if (typeof days === 'number')
    {
      businessDaysInMonth = days;
    }
    else
    {
      businessDaysInMonth = days.shift();

      _.forEach(days, function(day)
      {
        exports.holidays[key(year, month, day)] = true;
      });
    }

    var monthKey = key(year, month, 1);

    exports.months[monthKey] = businessDaysInMonth;

    if (month === 0 || month === 3 || month === 6 || month === 9)
    {
      quarterKey = monthKey;

      exports.quarters[quarterKey] = 0;
    }

    exports.quarters[quarterKey] += businessDaysInMonth;

    businessDaysInYear += businessDaysInMonth;
  });

  exports.years[key(year, 0, 1)] = businessDaysInYear;
}

function key(year, month, day)
{
  return new Date(year, month, day, 0, 0, 0, 0).getTime();
}
