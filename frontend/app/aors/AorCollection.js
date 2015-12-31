// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Aor'
], function(
  Collection,
  Aor
) {
  'use strict';

  return Collection.extend({

    model: Aor,

    rqlQuery: 'sort(name)',

    comparator: 'name'

  });
});
