// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './QiActionStatus'
], function(
  Collection,
  QiActionStatus
) {
  'use strict';

  return Collection.extend({

    model: QiActionStatus,

    comparator: 'position'

  });
});
