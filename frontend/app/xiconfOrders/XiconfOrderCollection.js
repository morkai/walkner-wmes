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

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          items: 0
        },
        sort: {
          reqDate: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'lt', args: ['reqDate', time.getMoment().startOf('day').add(1, 'days').valueOf()]}
          ]
        }
      });
    }

  });
});
