// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Suggestion'
], function(
  Collection,
  Suggestion
) {
  'use strict';

  return Collection.extend({

    model: Suggestion,

    rqlQuery: 'exclude(changes)&limit(15)&sort(-date)'

  });
});
