// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([], function()
{
  'use strict';

  return function(input, sorted)
  {
    if (input.length === 0)
    {
      return 0;
    }

    if (input.length === 1)
    {
      return input[0];
    }

    if (!sorted)
    {
      input.sort(function(a, b) { return a - b; });
    }

    if (input.length % 2 === 0)
    {
      return (input[input.length / 2 - 1] + input[input.length / 2]) / 2;
    }

    return input[(input.length + 1) / 2 - 1];
  };
});
