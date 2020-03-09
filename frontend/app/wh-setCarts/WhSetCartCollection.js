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
        sort: {
          date: -1
        },
        limit: -1337
      });
    }

  });
});
