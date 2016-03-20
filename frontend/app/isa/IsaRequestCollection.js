// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './IsaRequest'
], function(
  Collection,
  IsaRequest
) {
  'use strict';

  return Collection.extend({

    model: IsaRequest,

    rqlQuery: 'sort(-requestedAt)&limit(20)'

  });
});
