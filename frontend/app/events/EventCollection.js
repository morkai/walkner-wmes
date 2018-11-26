// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  '../core/Collection',
  './Event'
], function(
  time,
  Collection,
  Event
) {
  'use strict';

  return Collection.extend({

    model: Event,

    rowHeight: false,

    rqlQuery: function(rql)
    {
      var sevenDaysAgo = time.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(7, 'days').valueOf();

      return rql.Query.fromObject({
        fields: {type: 1, severity: 1, user: 1, time: 1, data: 1},
        sort: {time: -1},
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['time', sevenDaysAgo]}
          ]
        }
      });
    }

  });
});
