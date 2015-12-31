// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');
var util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  step(
    function getProdDowntimeModelStep()
    {
      productionModule.getProdData('downtime', logEntry.data._id, this.next());
    },
    function getProdShiftOrderModelStep(err, prodDowntime)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find downtime [%s] to delete (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (!prodDowntime)
      {
        productionModule.warn(
          "Downtime [%s] not found for deletion (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, null);
      }

      var next = this.next();
      var orderId = prodDowntime.prodShiftOrder;

      if (orderId)
      {
        productionModule.getProdData('order', orderId, function(err, prodShiftOrder)
        {
          if (err)
          {
            productionModule.error(
              "Failed to find order [%s] while deleting downtime [%s] (LOG=[%s]): %s",
              orderId,
              logEntry.data._id,
              logEntry._id,
              err.stack
            );
          }

          next(err, prodDowntime, prodShiftOrder);
        });
      }
      else
      {
        next(null, prodDowntime, null);
      }
    },
    function deleteProdDowntimeStep(err, prodDowntime, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find order [%s] while deleting downtime [%s] (LOG=[%s]): %s",
          prodDowntime.prodShiftOrder,
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      this.prodDowntime = prodDowntime;
      this.prodShiftOrder = prodShiftOrder;

      prodDowntime.remove(this.next());
    },
    function recalcOrderDurationsStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to delete downtime [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      if (!productionModule.recreating)
      {
        app.broker.publish('prodDowntimes.deleted.' + this.prodDowntime._id, {
          _id: this.prodDowntime._id,
          rid: this.prodDowntime.rid,
          prodLine: this.prodDowntime.prodLine,
          prodShift: this.prodDowntime.prodShift,
          prodShiftOrder: this.prodDowntime.prodShiftOrder
        });
      }

      if (this.prodShiftOrder)
      {
        this.prodShiftOrder.recalcDurations(true, this.next());
      }
    },
    function handleRecalcDurationsResultStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to recalc order [%s] durations after deleting downtime [%s] (LOG=[%s]): %s",
          this.prodShiftOrder._id,
          logEntry.data._id,
          logEntry._id,
          err.stack
        );
      }
    },
    util.createRecalcShiftTimesStep(productionModule, logEntry),
    done
  );
};
