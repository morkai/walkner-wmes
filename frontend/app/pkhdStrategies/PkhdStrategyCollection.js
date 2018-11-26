// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PkhdStrategy'
], function(
  Collection,
  PkhdStrategy
) {
  'use strict';

  return Collection.extend({

    model: PkhdStrategy,

    rqlQuery: 'sort(name)&limit(-1337)'

  });
});
