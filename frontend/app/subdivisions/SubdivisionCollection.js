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

    rqlQuery: 'select(division,name)&sort(division,name)'

  });
});
