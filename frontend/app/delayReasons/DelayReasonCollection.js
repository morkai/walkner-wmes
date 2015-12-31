// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    rqlQuery: 'select(name)&sort(name)',

    comparator: 'name'

  });
});
