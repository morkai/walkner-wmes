// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Order'
], function(
  Collection,
  Order
) {
  'use strict';

  return Collection.extend({

    model: Order,

    rqlQuery: function(rql)
    {
      var today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      return rql.Query.fromObject({
        fields: {
          operations: 0,
          bom: 0,
          documents: 0,
          changes: 0
        },
        limit: 20,
        sort: {
          finishDate: 1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['finishDate', today.getTime()]},
            {name: 'le', args: ['finishDate', today.getTime()]}
          ]
        }
      });
    }

  });
});
