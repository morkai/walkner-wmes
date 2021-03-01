// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Accident'
], function(
  Collection,
  Accident
) {
  'use strict';

  return Collection.extend({

    model: Accident,

    rqlQuery: 'exclude(changes)&sort(-createdAt)&limit(-1337)'

  });
});
