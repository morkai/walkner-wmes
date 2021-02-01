// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return (v) =>
  {
    if (!v || !isFinite(v))
    {
      return 0;
    }

    return Math.round(v * 100);
  };
});
