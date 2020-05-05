// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ProductTag'
], function(
  Collection,
  ProductTag
) {
  'use strict';

  return Collection.extend({

    model: ProductTag,

    rqlQuery: 'exclude(conditions)&limit(100)'

  });
});
