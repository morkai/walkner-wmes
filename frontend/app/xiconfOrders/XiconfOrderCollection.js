// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './XiconfOrder'
], function(
  time,
  Collection,
  XiconfOrder
) {
  'use strict';

  return Collection.extend({

    model: XiconfOrder,

    rowHeight: false,

    rqlQuery: function(rql)
    {
      var today = time.getMoment().startOf('day');

      return rql.Query.fromObject({
        fields: {
          items: 0
        },
        sort: {
          reqDate: -1
        },
        limit: -1,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['reqDate', today.subtract(7, 'days').valueOf()]},
            {name: 'lt', args: ['reqDate', today.add(8, 'days').valueOf()]}
          ]
        }
      });
    }

  });
});
