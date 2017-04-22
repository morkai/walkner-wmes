// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './MinutesForSafetyCard'
], function(
  Collection,
  MinutesForSafetyCard
) {
  'use strict';

  return Collection.extend({

    model: MinutesForSafetyCard,

    rqlQuery: 'limit(20)&sort(-date)'

  });
});
