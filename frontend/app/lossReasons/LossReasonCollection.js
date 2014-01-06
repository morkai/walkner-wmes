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
