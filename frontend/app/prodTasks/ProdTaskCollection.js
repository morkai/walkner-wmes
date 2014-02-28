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

    rqlQuery: 'select(name,tags,fteDiv,clipColor)&sort(name)'

  });
});
