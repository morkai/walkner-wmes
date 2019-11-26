// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './KaizenOrder'
], function(
  time,
  Collection,
  KaizenOrder
) {
  'use strict';

  return Collection.extend({

    model: KaizenOrder,

    rowHeight: 2,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['eventDate', time.getMoment().subtract(90, 'days')]}
          ]
        },
        fields: {
          changes: 0
        },
        sort: {
          eventDate: -1
        },
        limit: -1337
      });
    }

  });
});
