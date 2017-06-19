// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function parseSapNumber(input)
{
  const output = parseFloat(String(input).replace(/\./g, '').replace(/\s+/g, '').replace(',', '.'));

  return isNaN(output) ? -1 : output;
};
