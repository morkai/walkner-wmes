// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function parseSapTime(input)
{
  const matches = input.match(/^([0-9]{2}):?([0-9]{2})(?::?([0-9]{2}))?$/);

  return matches === null ? null : {
    h: +matches[1],
    m: +matches[2],
    s: matches[3] === undefined ? 0 : +matches[3]
  };
};
