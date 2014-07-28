// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function parseSapNumber(input)
{
  var output = parseFloat(String(input).replace(/\./g, '').replace(/\s+/g, '').replace(',', '.'));

  return isNaN(output) ? -1 : output;
};
