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

    sort: function(a, b)
    {
      return a.attributes.requestedAt - b.attributes.requestedAt;
    }

  });
});
