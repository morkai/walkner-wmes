// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './DelayReason'
], function(
  Collection,
  DelayReason
) {
  'use strict';

  return Collection.extend({

    model: DelayReason,

    rqlQuery: 'sort(name)',

    comparator: 'name'

  });
});
