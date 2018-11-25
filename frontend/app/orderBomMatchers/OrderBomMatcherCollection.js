// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OrderBomMatcher'
], function(
  Collection,
  OrderBomMatcher
) {
  'use strict';

  return Collection.extend({

    model: OrderBomMatcher,

    rqlQuery: 'sort(description)&limit(-1)'

  });
});
