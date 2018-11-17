// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function parseSapString(input)
{
  if (input == null)
  {
    return '';
  }

  if (typeof input !== 'string')
  {
    return String(input);
  }

  return input.replace(/\s+/g, ' ');
};
