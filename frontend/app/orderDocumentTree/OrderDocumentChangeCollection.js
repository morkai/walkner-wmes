// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OrderDocumentChange'
], function(
  Collection,
  OrderDocumentChange
) {
  'use strict';

  return Collection.extend({

    model: OrderDocumentChange

  });
});
