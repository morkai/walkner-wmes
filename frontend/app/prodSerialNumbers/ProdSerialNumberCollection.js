// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ProdSerialNumber'
], function(
  Collection,
  ProdSerialNumber
) {
  'use strict';

  return Collection.extend({

    model: ProdSerialNumber,

    rqlQuery: 'sort(-scannedAt)&limit(20)'

  });
});
