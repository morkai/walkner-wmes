// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    theadHeight: 2,

    rqlQuery: 'limit(-1)&sort(-date)'

  });
});
