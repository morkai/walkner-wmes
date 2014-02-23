'use strict';

var INTERVAL_STR_TO_NUM = {
  hour: 3600 * 1000,
  shift: 8 * 3600 * 1000,
  day: 24 * 3600 * 1000,
  week: 7 * 24 * 3600 * 1000
};

/**
 * @param {string} interval
 * @returns {function(number): number}
 */
exports.createCreateNextGroupKey = function(interval)
{
  if (interval === 'month')
  {
    return function createNextGroupKey(groupKey)
    {
      var date = new Date(groupKey);

      return date.setMonth(date.getMonth() + 1);
    };
  }

  return function createNextGroupKey(groupKey)
  {
    return groupKey + INTERVAL_STR_TO_NUM[interval];
  };
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
