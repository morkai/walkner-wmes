// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  function compare(a, b, desc)
  {
    if (a === b)
    {
      return 0;
    }

    let cmp = 0;

    switch (typeof a)
    {
      case 'string':
        cmp = a.localeCompare(b);
        break;

      case 'number':
        cmp = a - b;
        break;

      default:
      {
        if (a == null)
        {
          if (b == null)
          {
            return 0;
          }

          cmp = 1;

          break;
        }

        if (b == null)
        {
          cmp = -1;

          break;
        }

        cmp = String(a).localeCompare(String(b));

        break;
      }
    }

    if (cmp !== 0 && desc)
    {
      return cmp === -1 ? 1 : -1;
    }

    return cmp;
  }

  return function sortByProps(props, desc)
  {
    return function(a, b)
    {
      let cmp = 0;

      for (let i = 0; !cmp && i < props.length; ++i)
      {
        const prop = props[i];

        cmp = compare(a[prop], b[prop], desc);
      }

      return cmp;
    };
  };
});
