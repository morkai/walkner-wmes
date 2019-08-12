// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return {
    start: function padStart(str, targetLength, padString)
    {
      while (str.length < targetLength)
      {
        str = padString + str;
      }

      return str;
    },
    end: function(str, targetLength, padString)
    {
      while (str.length < targetLength)
      {
        str += padString;
      }

      return str;
    }
  };
});
