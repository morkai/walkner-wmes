// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Pce'
], function(
  Collection,
  Pce
) {
  'use strict';

  return Collection.extend({

    model: Pce,

    rqlQuery: 'limit(-1337)&sort(-startedAt)'

  });
});
