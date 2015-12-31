// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Subdivision'
], function(
  Collection,
  Subdivision
) {
  'use strict';

  return Collection.extend({

    model: Subdivision,

    rqlQuery: 'sort(division,name)',

    comparator: 'type'

  });
});
