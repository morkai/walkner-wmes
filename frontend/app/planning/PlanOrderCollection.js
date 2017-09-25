// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanOrder'
], function(
  Collection,
  PlanOrder
) {
  'use strict';

  return Collection.extend({

    model: PlanOrder

  });
});
