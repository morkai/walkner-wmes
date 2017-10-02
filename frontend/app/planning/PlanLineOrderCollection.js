// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanLineOrder'
], function(
  Collection,
  PlanLineOrder
) {
  'use strict';

  return Collection.extend({

    model: PlanLineOrder,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    }

  });
});
