// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/Model'
], function(
  _,
  Model
) {
  'use strict';

  return Model.extend({

    initialize: function(attrs, options)
    {
      this.prodLineId = options.prodLineId;
    },

    url: function()
    {
      return '/production/planExecution/' + this.prodLineId + '?queue=0';
    },

    parse: function(res)
    {
      return res.execution;
    },

    startDowntime: function(prodDowntime)
    {
      var oldDowntimes = this.get('doneDowntimes') || [];
      var newDowntime = this.serializeDowntime(prodDowntime);
      var newDowntimes = oldDowntimes.concat(newDowntime);

      this.set('doneDowntimes', newDowntimes);
    },

    updateDowntime: function(prodDowntime)
    {
      var downtimes = this.get('doneDowntimes') || [];
      var lastDowntime = downtimes[downtimes.length - 1];

      if (!lastDowntime)
      {
        return;
      }

      _.assign(lastDowntime, this.serializeDowntime(prodDowntime));

      this.trigger('change:lastDowntime', lastDowntime);
    },

    startOrder: function(prodShiftOrder)
    {
      var oldOrders = this.get('doneOrders') || [];
      var newOrder = this.serializeOrder(prodShiftOrder);
      var newOrders = oldOrders.concat(newOrder);

      this.set('doneOrders', newOrders);
    },

    updateOrder: function(prodShiftOrder)
    {
      var orders = this.get('doneOrders') || [];
      var lastOrder = orders[orders.length - 1];

      if (!lastOrder)
      {
        return;
      }

      _.assign(lastOrder, this.serializeOrder(prodShiftOrder));

      this.trigger('change:lastOrder', lastOrder);
    },

    serializeDowntime: function(prodDowntime)
    {
      var finishedAt = prodDowntime.get('finishedAt');

      return {
        reason: prodDowntime.get('reason'),
        aor: prodDowntime.get('aor'),
        startedAt: prodDowntime.get('startedAt').toISOString(),
        finishedAt: finishedAt ? finishedAt.toISOString() : null
      };
    },

    serializeOrder: function(prodShiftOrder)
    {
      var finishedAt = prodShiftOrder.get('finishedAt');

      return {
        orderId: prodShiftOrder.get('orderId'),
        operationNo: prodShiftOrder.get('operationNo'),
        quantityDone: prodShiftOrder.get('quantityDone'),
        workerCount: prodShiftOrder.get('workerCount'),
        startedAt: prodShiftOrder.get('startedAt').toISOString(),
        finishedAt: finishedAt ? finishedAt.toISOString() : null,
        taktTime: prodShiftOrder.get('avgTaktTime') && prodShiftOrder.get('sapTaktTime')
          ? (prodShiftOrder.isTaktTimeOk() ? 'ok' : 'nok')
          : 'na'
      };
    }

  });
});
