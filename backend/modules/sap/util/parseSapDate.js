// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function parseSapDate(input)
{
  var matches = input.match(/^([0-9]{2})[.\/-]?([0-9]{2})[.\/-]?([0-9]{4})$/);

  if (matches !== null)
  {
    return {
      y: +matches[3],
      m: +matches[2],
      d: +matches[1]
    };
  }

  matches = input.match(/^([0-9]{4})[.\/-]?([0-9]{2})[.\/-]?([0-9]{2})$/);

  if (matches !== null)
  {
    return {
      y: +matches[1],
      m: +matches[2],
      d: +matches[3]
    };
  }

  return null;
};
