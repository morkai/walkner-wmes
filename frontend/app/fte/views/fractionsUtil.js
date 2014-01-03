define(function()
{
  'use strict';

  return {
    parse: function(val)
    {
      var num = parseFloat(val.replace(',', '.').replace(/[^0-9\.]+/g, ''));

      return isNaN(num) || num < 0 ? 0 : num;
    },
    round: function(num)
    {
      return (Math.round(num * 10000) / 10000).toString();
    }
  };
});
