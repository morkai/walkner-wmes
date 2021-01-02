// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PaintShopLoadReason'
], function(
  Collection,
  PaintShopLoadReason
) {
  'use strict';

  return Collection.extend({

    model: PaintShopLoadReason,

    rqlQuery: 'sort(position)'

  });
});
