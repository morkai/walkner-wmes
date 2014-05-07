// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(function()
{
  'use strict';

  var toString = typeof Number.prototype.toLocaleString === 'function'
    ? 'toLocaleString'
    : 'toString';

  return {
    parse: function(val)
    {
      var num = parseFloat(val.replace(',', '.').replace(/[^0-9\.]+/g, ''));

      return isNaN(num) || num < 0 ? 0 : num;
    },
    round: function(num)
    {
      return (Math.round(num * 10000) / 10000)[toString]();
    }
  };
});
