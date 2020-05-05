// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './Order'
], function(
  time,
  Collection,
  Order
) {
  'use strict';

  return Collection.extend({

    model: Order,

    rqlQuery: function(rql)
    {
      var startDate = time.getMoment().startOf('day');

      return rql.Query.fromObject({
        fields: {
          operations: 0,
          bom: 0,
          documents: 0,
          notes: 0,
          changes: 0
        },
        limit: -1337,
        sort: {
          scheduledStartDate: -1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['scheduledStartDate', startDate.valueOf()]},
            {name: 'lt', args: ['scheduledStartDate', startDate.add(1, 'days').valueOf()]}
          ]
        }
      });
    }

  });
});
