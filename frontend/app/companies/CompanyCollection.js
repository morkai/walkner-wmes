define([
  '../core/Collection',
  './Company'
], function(
  Collection,
  Company
) {
  'use strict';

  return Collection.extend({

    model: Company,

    rqlQuery: 'select(name,fteMasterPosition,fteLeaderPosition)&sort(_id)'

  });
});
