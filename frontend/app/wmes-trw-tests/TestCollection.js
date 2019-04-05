// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Test'
], function(
  Collection,
  Test
) {
  'use strict';

  return Collection.extend({

    model: Test,

    rqlQuery: 'sort(-startedAt)&limit(-1337)'

  });
});
