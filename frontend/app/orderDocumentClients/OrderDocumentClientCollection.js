// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OrderDocumentClient'
], function(
  Collection,
  OrderDocumentClient
) {
  'use strict';

  return Collection.extend({

    model: OrderDocumentClient,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {},
        sort: {prodLine: 1},
        limit: -1337
      });
    }

  });
});
