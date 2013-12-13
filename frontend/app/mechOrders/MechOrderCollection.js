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
          importTs: 1
        },
        limit: 15,
        sort: {
          importTs: -1
        }
      });
    }

  });
});
