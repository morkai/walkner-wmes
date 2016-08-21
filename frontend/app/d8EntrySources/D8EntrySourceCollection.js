// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './D8EntrySource'
], function(
  Collection,
  D8EntrySource
) {
  'use strict';

  return Collection.extend({

    model: D8EntrySource,

    comparator: 'position'

  });
});
