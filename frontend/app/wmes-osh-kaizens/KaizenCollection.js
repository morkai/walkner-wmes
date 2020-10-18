// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Kaizen'
], function(
  Collection,
  Kaizen
) {
  'use strict';

  return Collection.extend({

    model: Kaizen,

    rqlQuery: 'exclude(changes)&sort(-createdAt)&limit(-1337)'

  });
});
