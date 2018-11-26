// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './MechOrder'
], function(
  Collection,
  MechOrder
) {
  'use strict';

  return Collection.extend({

    model: MechOrder,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          name: 1,
          mrp: 1,
          materialNorm: 1
        },
        limit: 20,
        sort: {
          _id: 1
        }
      });
    }

  });
});
