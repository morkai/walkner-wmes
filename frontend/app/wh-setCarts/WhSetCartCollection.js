// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './WhSetCart'
], function(
  $,
  time,
  Collection,
  getShiftStartInfo,
  WhSetCart
) {
  'use strict';

  return Collection.extend({

    model: WhSetCart,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['date', time.getMoment().startOf('day').subtract(7, 'days').utc(true).valueOf()]}
          ]
        },
        sort: {
          date: -1,
          set: 1,
          kind: 1,
          cart: 1
        },
        limit: -1337
      });
    }

  });
});
