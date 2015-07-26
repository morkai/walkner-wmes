// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        limit: 20
      });
    }

  });
});
