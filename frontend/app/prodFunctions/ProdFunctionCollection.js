define([
  '../core/Collection',
  './ProdFunction'
], function(
  Collection,
  ProdFunction
) {
  'use strict';

  return Collection.extend({

    model: ProdFunction,

    rqlQuery: 'sort(fteMasterPosition)'

  });
});
