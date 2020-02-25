// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ProductNote'
], function(
  Collection,
  ProductNote
) {
  'use strict';

  return Collection.extend({

    model: ProductNote,

    rqlQuery: 'limit(-1337)'

  });
});
