define([
  '../core/Collection',
  './ProdLine'
], function(
  Collection,
  ProdLine
) {
  'use strict';

  return Collection.extend({

    model: ProdLine,

    rqlQuery: 'select(workCenter,description)&sort(workCenter,_id)'

  });
});
