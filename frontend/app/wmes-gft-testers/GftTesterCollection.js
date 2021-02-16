// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './GftTester'
], function(
  Collection,
  GftTester
) {
  'use strict';

  return Collection.extend({

    model: GftTester,

    rqlQuery: 'limit(-1337)&sort(name)'

  });
});
