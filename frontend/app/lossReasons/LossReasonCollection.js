// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './LossReason'
], function(
  Collection,
  LossReason
) {
  'use strict';

  return Collection.extend({

    model: LossReason,

    rqlQuery: 'select(label,position)&sort(position)'

  });
});
