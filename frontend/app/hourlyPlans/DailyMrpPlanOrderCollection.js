// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Collection',
  './DailyMrpPlanOrder'
], function(
  _,
  Collection,
  DailyMrpPlanOrder
) {
  'use strict';

  return Collection.extend({

    model: DailyMrpPlanOrder,

    initialize: function(attrs, options)
    {
      this.plan = options.plan;
    },

    update: function(newOrders)
    {
      var orders = this;
      var oldOrderIds = _.pluck(orders.models, 'id');
      var newOrderIds = _.pluck(newOrders, '_id');

      if (_.isEqual(newOrderIds, oldOrderIds))
      {
        return;
      }

      newOrders = newOrders.map(function(newOrder)
      {
        return orders.get(newOrder._id) || new DailyMrpPlanOrder(newOrder);
      });

      return orders.plan.collection.update('resetOrders', orders.plan.id, {
        orders: newOrders
      });
    }

  });
});
