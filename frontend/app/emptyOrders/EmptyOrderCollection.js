// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './EmptyOrder'
], function(
  time,
  Collection,
  EmptyOrder
) {
  'use strict';

  return Collection.extend({

    model: EmptyOrder,

    rqlQuery: function(rql)
    {
      var today = time.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);

      return rql.Query.fromObject({
        fields: {nc12: 1, mrp: 1, startDate: 1, finishDate: 1},
        sort: {startDate: -1, finishDate: -1},
        limit: -1337,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['startDate', today.valueOf()]},
            {name: 'le', args: ['startDate', today.valueOf()]}
          ]
        }
      });
    }

  });
});
