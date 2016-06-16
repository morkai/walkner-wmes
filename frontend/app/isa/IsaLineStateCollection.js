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
      a = a.attributes;
      b = b.attributes;

      if (a.requestedAt === null)
      {
        return 1;
      }

      if (b.requestedAt === null)
      {
        return -1;
      }

      if (a.requestType !== b.requestType)
      {
        return a.requestType === 'delivery' ? -1 : 1;
      }

      return a.requestedAt - b.requestedAt;
    }

  });
});
