// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Observation'
], function(
  Collection,
  Observation
) {
  'use strict';

  return Collection.extend({

    model: Observation,

    rqlQuery: 'exclude(changes)&sort(-createdAt)&limit(-1337)'

  });
});
