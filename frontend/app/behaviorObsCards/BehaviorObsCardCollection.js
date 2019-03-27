// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Collection',
  './BehaviorObsCard'
], function(
  user,
  Collection,
  BehaviorObsCard
) {
  'use strict';

  return Collection.extend({

    model: BehaviorObsCard,

    theadHeight: 2,

    rqlQuery: 'limit(-1337)&sort(-date)&lang(' + user.lang + ')'

  });
});
