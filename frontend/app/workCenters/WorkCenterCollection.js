define([
  'app/core/Collection',
  './WorkCenter'
], function(
  Collection,
  WorkCenter
) {
  'use strict';

  return Collection.extend({

    model: WorkCenter,

    rqlQuery: 'select(description)&sort(_id)'

  });
});
