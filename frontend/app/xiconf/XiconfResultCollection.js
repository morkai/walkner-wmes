// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Collection',
  './XiconfResult'
], function(
  _,
  time,
  Collection,
  XiconfResult
) {
  'use strict';

  return Collection.extend({

    model: XiconfResult,

    rowHeight: false,

    rqlQuery: function(rql)
    {
      var weekAgo = time.getMoment().hours(6).startOf('hour').subtract(7, 'days').valueOf();

      return rql.Query.fromObject({
        fields: {
          log: 0,
          metrics: 0,
          leds: 0,
          hidLamps: 0
        },
        sort: {
          startedAt: -1
        },
        limit: -1337,
        selector: {
          name: 'and',
          args: [{name: 'ge', args: ['startedAt', weekAgo]}]
        }
      });
    }

  });
});
