// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Location'
], function(
  Collection,
  Location
) {
  'use strict';

  return Collection.extend({

    model: Location,

    comparator: (a, b) => a.get('shortName').localeCompare(b.get('shortName'), undefined, {
      ignorePunctuation: true,
      numeric: true
    })

  });
});
