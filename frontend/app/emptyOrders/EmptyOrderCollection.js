define([
  '../core/Collection',
  './EmptyOrder'
], function(
  Collection,
  EmptyOrder
) {
  'use strict';

  return Collection.extend({

    model: EmptyOrder,

    rqlQuery: function(rql)
    {
      var today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      return rql.Query.fromObject({
        fields: {nc12: 1, mrp: 1, startDate: 1, finishDate: 1},
        sort: {startDate: -1, finishDate: -1},
        limit: 15,
        selector: {
          name: 'and',
          args: [{name: 'eq', args: ['startDate', today.getTime()]}]
        }
      });
    }

  });
});
