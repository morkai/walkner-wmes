// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './WhEvent'
], function(

  Collection,
  WhEvent
) {
  'use strict';

  return Collection.extend({

    model: WhEvent,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        sort: {
          time: -1
        },
        limit: 20
      });
    }

  });
});
