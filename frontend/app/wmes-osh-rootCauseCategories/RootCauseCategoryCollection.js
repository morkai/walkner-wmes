// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './RootCauseCategory'
], function(
  Collection,
  RootCauseCategory
) {
  'use strict';

  return Collection.extend({

    model: RootCauseCategory,

    sort: (a, b) => a.get('position') - b.get('position')

  });
});
