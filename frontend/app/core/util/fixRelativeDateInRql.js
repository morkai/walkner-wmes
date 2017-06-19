// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  './getRelativeDateRange'
], function(
  time,
  getRelativeDateRange
) {
  'use strict';

  return function fixRelativeDateInRql(rql, options)
  {
    if (!rql || !rql.selector)
    {
      return rql;
    }

    var selector = [];

    rql.selector.args.forEach(function(term)
    {
      if (term.name !== 'eq' || term.args[0] !== options.property)
      {
        selector.push(term);

        return;
      }

      var dateRange = getRelativeDateRange(term.args[1], options.shift);

      if (!dateRange)
      {
        selector.push(term);

        return;
      }

      if (options.range)
      {
        selector.push({
          name: 'ge',
          args: [
            options.property,
            options.format ? time.format(dateRange.from, options.format) : dateRange.from.valueOf()
          ]
        });
        selector.push({
          name: 'lt',
          args: [
            options.property,
            options.format ? time.format(dateRange.to, options.format) : dateRange.to.valueOf()
          ]
        });
      }
      else
      {
        selector.push({
          name: 'eq',
          args: [
            options.property,
            options.format ? time.format(dateRange.from, options.format) : dateRange.from.valueOf()
          ]
        });
      }
    });

    rql.selector.args = selector;

    return rql;
  };
});
