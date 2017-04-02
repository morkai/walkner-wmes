// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './BehaviorObsCard'
], function(
  Collection,
  BehaviorObsCard
) {
  'use strict';

  return Collection.extend({

    model: BehaviorObsCard,

    rqlQuery: 'limit(20)&sort(-date)'

  });
});
