define([
  '../core/Collection',
  './ProdCenter'
], function(
  Collection,
  ProdCenter
) {
  'use strict';

  return Collection.extend({

    model: ProdCenter,

    rqlQuery: 'select(description)&sort(_id)'

  });
});
