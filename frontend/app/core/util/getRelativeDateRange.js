// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function getRelativeDateRange(input, shift)
  {
    var matches = (input || '').toString().match(/([0-9]+)(?:-([0-9]+))?d/);

    if (!matches)
    {
      return null;
    }

    var daysFrom = parseInt(matches[1], 10);
    var daysTo = parseInt(matches[2], 10) || 0;
    var from = time.getMoment();
    var h = from.hours();

    from.startOf('day');

    if (shift && h < 6)
    {
      from.subtract(1, 'days');
    }

    var to = from.clone();

    if (daysTo === 0)
    {
      from.add(daysFrom, 'days');
      to.add(daysFrom + 1, 'days');
    }
    else
    {
      from.add(daysFrom, 'days');
      to.add(daysTo, 'days');
    }

    return {
      from: from.toDate(),
      to: to.toDate()
    };
  };
});
