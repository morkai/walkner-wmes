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
          nc12: 1,
          name: 1,
          mrp: 1,
          qty: 1,
          unit: 1,
          startDate: 1,
          finishDate: 1,
          statuses: 1
        },
        limit: 15,
        sort: {
          startDate: -1,
          finishDate: -1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['finishDate', today.getTime()]}
          ]
        }
      });
    }

  });
});
