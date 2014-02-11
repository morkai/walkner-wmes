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

    rqlQuery: 'select(division,type,name,prodTaskTags,aor)&sort(division,name)'

  });
});
