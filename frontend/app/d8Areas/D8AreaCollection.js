// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './D8Area'
], function(
  Collection,
  D8Area
) {
  'use strict';

  return Collection.extend({

    model: D8Area,

    comparator: 'position'

  });
});
