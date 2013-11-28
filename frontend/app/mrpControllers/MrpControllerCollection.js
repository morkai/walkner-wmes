define([
  '../core/Collection',
  './MrpController'
], function(
  Collection,
  MrpController
) {
  'use strict';

  return Collection.extend({

    model: MrpController,

    rqlQuery: 'select(subdivision,description)&sort(_id)'

  });
});
