// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './NearMiss'
], function(
  Collection,
  NearMiss
) {
  'use strict';

  return Collection.extend({

    model: NearMiss,

    rqlQuery: 'exclude(changes)&sort(-createdAt)&limit(-1337)'

  });
});
