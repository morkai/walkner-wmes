define([
  '../core/Collection',
  './ProdTask'
], function(
  Collection,
  ProdTask
) {
  'use strict';

  return Collection.extend({

    model: ProdTask,

    rqlQuery: 'select(name,aors)&sort(name)&limit(15)'

  });
});
