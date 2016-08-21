// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './D8ProblemSource'
], function(
  Collection,
  D8ProblemSource
) {
  'use strict';

  return Collection.extend({

    model: D8ProblemSource,

    comparator: 'position'

  });
});
