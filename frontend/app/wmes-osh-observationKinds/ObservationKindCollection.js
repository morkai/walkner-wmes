// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './ObservationKind'
], function(
  Collection,
  ObservationKind
) {
  'use strict';

  return Collection.extend({

    model: ObservationKind,

    comparator: (a, b) => a.get('position') - b.get('position')

  });
});
