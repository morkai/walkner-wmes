// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Tester'
], function(
  Collection,
  Tester
) {
  'use strict';

  return Collection.extend({

    model: Tester,

    rqlQuery: 'sort(name)&limit(-1337)'

  });
});
