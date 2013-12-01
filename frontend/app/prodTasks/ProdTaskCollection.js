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

    rqlQuery: 'select(name,fteMaster,fteLeader)&sort(name)&limit(15)'

  });
});
