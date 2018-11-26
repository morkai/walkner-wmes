// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './PurchaseOrder'
], function(
  time,
  Collection,
  PurchaseOrder
) {
  'use strict';

  return Collection.extend({

    model: PurchaseOrder,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          changes: 0,
          'items.prints': 0
        },
        limit: 20,
        sort: {
          'scheduledAt': 1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'eq', args: ['open', true]},
            {name: 'populate', args: ['vendor']}
          ]
        }
      });
    }

  });
});
