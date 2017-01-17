// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  './getRelativeDateRange'
], function(
  time,
  getRelativeDateRange
) {
  'use strict';

  return function fixRelativeDateInRql(rql, prop, range, format)
  {
    if (!rql || !rql.selector)
    {
      return rql;
    }

    var selector = [];

    rql.selector.args.forEach(function(term)
    {
      if (term.name !== 'eq' || term.args[0] !== prop)
      {
        selector.push(term);

        return;
      }

      var dateRange = getRelativeDateRange(term.args[1]);

      if (!dateRange)
      {
        selector.push(term);

        return;
      }

      if (range)
      {
        selector.push({
          name: 'ge',
          args: [prop, format ? time.format(dateRange.from, format) : dateRange.from.valueOf()]
        });
        selector.push({
          name: 'lt',
          args: [prop, format ? time.format(dateRange.to, format) : dateRange.to.valueOf()]
        });
      }
      else
      {
        selector.push({
          name: 'eq',
          args: [prop, format ? time.format(dateRange.from, format) : dateRange.from.valueOf()]
        });
      }
    });

    rql.selector.args = selector;

    return rql;
  };
});
