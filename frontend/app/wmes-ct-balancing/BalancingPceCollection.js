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

    rqlQuery: 'sort(-startedAt)&limit(-1337)'

  });
});
