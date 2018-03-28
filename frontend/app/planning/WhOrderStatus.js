// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  var DEFAULT_WH_ORDER_STATUS = {
    status: 0,
    updatedAt: new Date(),
    updater: null
  };

  return Model.extend({

    urlRoot: '/planning/whOrderStatuses',

    topicPrefix: 'planning.whOrderStatuses',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    defaults: function()
    {
      return {
        orders: {}
      };
    },

    setOrderStatus: function(key, value)
    {
      this.attributes.orders[key] = value;

      this.trigger('change:orders', key, value);
    },

    getOrderStatus: function(key)
    {
      return this.attributes.orders[key] || DEFAULT_WH_ORDER_STATUS;
    }

  });
});
