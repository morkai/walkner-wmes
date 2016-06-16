// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './IsaLineState'
], function(
  Collection,
  IsaLineState
) {
  'use strict';

  return Collection.extend({

    model: IsaLineState,

    parse: function(res)
    {
      return res.collection.map(IsaLineState.parse);
    },

    comparator: function(a, b)
    {
      if (a.attributes.requestedAt === null)
      {
        return 1;
      }

      if (b.attributes.requestedAt === null)
      {
        return -1;
      }

      return a.attributes.requestedAt - b.attributes.requestedAt;
    }

  });
});
