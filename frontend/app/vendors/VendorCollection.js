// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Vendor'
], function(
  Collection,
  Vendor
) {
  'use strict';

  return Collection.extend({

    model: Vendor,

    rqlQuery: 'limit(-1)&sort(name)'

  });
});
