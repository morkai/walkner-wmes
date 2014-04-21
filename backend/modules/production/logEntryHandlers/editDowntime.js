// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var changes = logEntry.data;

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
          "Failed to find downtime [%s] to edit (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      var next = this.next();
      var orderId = prodDowntime.prodShiftOrder;

      if (orderId && (changes.startedAt || changes.finishedAt))
      {
        productionModule.getProdData('order', orderId, function(err, prodShiftOrder)
        {
          if (err)
          {
            productionModule.error(
              "Failed to find order [%s] while editing downtime [%s] (LOG=[%s]): %s",
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
    function updateProdDowntimeStep(err, prodDowntime, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find downtime [%s] to edit (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      delete changes._id;

      prodDowntime.set(changes);
      prodDowntime.save(this.next());

      this.prodShiftOrder = prodShiftOrder;
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
          "Failed to recalc order [%s] durations after editing downtime [%s] (LOG=[%s]): %s",
          this.prodShiftOrder._id,
          logEntry.data._id,
          logEntry._id,
          err.stack
        );
      }
    },
    done
  );
};
