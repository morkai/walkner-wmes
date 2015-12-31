// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
