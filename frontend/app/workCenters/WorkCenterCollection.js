// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    rqlQuery: 'select(mrpController,prodFlow,description,deactivatedAt)&sort(_id)',

    comparator: '_id'

  });
});
