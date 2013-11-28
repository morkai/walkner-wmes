define([
  '../core/Collection',
  './WorkCenter'
], function(
  Collection,
  WorkCenter
) {
  'use strict';

  return Collection.extend({

    model: WorkCenter,

    rqlQuery: 'select(mrpController,prodFlow,description)&sort(_id)'

  });
});
