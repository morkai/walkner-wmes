// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './BalancingPce'
], function(
  Collection,
  BalancingPce
) {
  'use strict';

  return Collection.extend({

    model: BalancingPce,

    rqlQuery: 'sort(-startedAt)&limit(100)',

    getProductFilter: function()
    {
      var term = this.findRqlTerm('order._id', 'eq') || this.findRqlTerm('order.nc12', 'eq');

      return term ? term.args[1] : null;
    }

  });
});
