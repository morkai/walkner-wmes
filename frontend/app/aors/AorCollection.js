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

    rqlQuery: 'select(name,description)&sort(name)'

  });
});
