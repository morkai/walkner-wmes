// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Reward'
], function(
  Collection,
  Reward
) {
  'use strict';

  return Collection.extend({

    model: Reward,

    rqlQuery: 'sort(-createdAt)&limit(-1337)'

  });
});
