// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PaintShopPaint'
], function(
  Collection,
  PaintShopPaint
) {
  'use strict';

  return Collection.extend({

    model: PaintShopPaint,

    rqlQuery: 'sort(shelf,bin)&limit(-1337)'

  });
});
