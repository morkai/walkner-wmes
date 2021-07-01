// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Payout'
], function(
  Collection,
  Payout
) {
  'use strict';

  return Collection.extend({

    model: Payout,

    rqlQuery: 'sort(-createdAt)&limit(-1337)'

  });
});
