// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([

], function(

) {
  'use strict';

  var DECIMAL_SEPARATOR = (1.1).toLocaleString().substr(1, 1);

  return function parseNumber(value, noDecimals)
  {
    var parts = String(value).split(DECIMAL_SEPARATOR);
    var negative = parts[0].charAt(0) === '-' ? -1 : 1;
    var integer = parseInt(parts[0].replace(/[^0-9]+/g, ''), 10);
    var decimals = parts.length > 1 ? parseInt(parts[1].replace(/[^0-9]+/g, ''), 10) : 0;

    integer = isNaN(integer) ? '0' : integer.toString();
    decimals = isNaN(decimals) ? '0' : decimals.toString();

    if (noDecimals || decimals === '0')
    {
      return integer === '0' ? 0 : (parseInt(integer, 10) * negative);
    }

    return parseFloat(integer + '.' + decimals.substr(0, 3)) * negative;
  };
});
