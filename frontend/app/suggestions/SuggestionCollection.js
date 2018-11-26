// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    theadHeight: 2,

    rowHeight: 1.5,

    rqlQuery: 'exclude(changes)&limit(20)&sort(-date)'

  });
});
