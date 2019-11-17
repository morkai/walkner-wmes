// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Cart'
], function(
  Collection,
  Cart
) {
  'use strict';

  return Collection.extend({

    model: Cart

  });
});
