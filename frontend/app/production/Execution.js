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

    nlsDomain: 'production',

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

    serializeDowntime: function(dt)
    {
      var finishedAt = dt.get('finishedAt');

      return {
        shift: dt.get('shift'),
        reason: dt.get('reason'),
        aor: dt.get('aor'),
        startedAt: dt.get('startedAt').getTime(),
        finishedAt: finishedAt ? finishedAt.getTime() : 0
      };
    },

    serializeOrder: function(pso)
    {
      var finishedAt = pso.get('finishedAt');

      return {
        shift: pso.get('shift'),
        orderId: pso.get('orderId'),
        operationNo: pso.get('operationNo'),
        quantityDone: pso.get('quantityDone'),
        workerCount: pso.get('workerCount'),
        startedAt: pso.get('startedAt').getTime(),
        finishedAt: finishedAt ? finishedAt.getTime() : 0,
        taktTime: pso.get('avgTaktTime') && pso.get('sapTaktTime')
          ? (pso.isTaktTimeOk() ? 'ok' : 'nok')
          : 'na'
      };
    }

  });
});
