// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OrderDocumentConfirmation'
], function(
  Collection,
  OrderDocumentConfirmation
) {
  'use strict';

  return Collection.extend({

    model: OrderDocumentConfirmation,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {},
        sort: {time: -1},
        limit: -1337
      });
    }

  });
});
