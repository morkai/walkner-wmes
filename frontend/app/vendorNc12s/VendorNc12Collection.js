// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './VendorNc12'
], function(
  Collection,
  VendorNc12
) {
  'use strict';

  return Collection.extend({

    model: VendorNc12,

    rqlQuery: 'limit(20)&sort(vendor,nc12)'

  });
});
