// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './D8Entry'
], function(
  Collection,
  D8Entry
) {
  'use strict';

  return Collection.extend({

    model: D8Entry,

    rqlQuery: 'exclude(changes)&limit(20)&sort(-d8OpenDate)'

  });
});
