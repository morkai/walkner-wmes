// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Entry'
], function(
  Collection,
  Entry
) {
  'use strict';

  return Collection.extend({

    model: Entry,

    rqlQuery: 'exclude(changes)&limit(-1337)&sort(-createdAt)'

  });
});
