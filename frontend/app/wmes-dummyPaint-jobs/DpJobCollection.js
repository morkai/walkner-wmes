// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './DpJob'
], function(
  Collection,
  DpJob
) {
  'use strict';

  return Collection.extend({

    model: DpJob,

    rqlQuery: 'limit(-1337)&sort(-createdAt)'

  });
});
