// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PscsResult'
], function(
  Collection,
  PscsResult
) {
  'use strict';

  return Collection.extend({

    model: PscsResult,

    rqlQuery: 'sort(-startedAt)&limit(15)'

  });
});
