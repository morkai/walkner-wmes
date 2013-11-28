define([
  '../core/Collection',
  './ProdFlow'
], function(
  Collection,
  ProdFlow
) {
  'use strict';

  return Collection.extend({

    model: ProdFlow,

    rqlQuery: 'select(mrpController,name)&sort(name)'

  });
});
