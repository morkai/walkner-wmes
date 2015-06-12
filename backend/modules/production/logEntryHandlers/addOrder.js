// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  step(
    function addOrderStep()
    {
      var prodShiftOrder = new ProdShiftOrder(logEntry.data);
      prodShiftOrder.save(this.parallel());

      productionModule.getProdDowntimes(prodShiftOrder.prodShift, this.parallel());
    },
    function updateDowntimesStep(err, prodShiftOrder, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save a new order [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      this.prodShiftOrder = prodShiftOrder;

      if (!prodDowntimes.length)
      {
        return;
      }

      var orderStartedAt = prodShiftOrder.startedAt;
      var orderFinishedAt = prodShiftOrder.finishedAt;
      var downtimeChanges = {
        master: prodShiftOrder.master,
        leader: prodShiftOrder.leader,
        operator: prodShiftOrder.operator,
        operators: prodShiftOrder.operators,
        orderId: prodShiftOrder.orderId,
        mechOrder: prodShiftOrder.mechOrder,
        operationNo: prodShiftOrder.operationNo,
        prodShiftOrder: prodShiftOrder._id,
        workerCount: prodShiftOrder.workerCount
      };

      for (var i = 0, l = prodDowntimes.length; i < l; ++i)
      {
        var prodDowntime = prodDowntimes[i];

        if (prodDowntime.prodShiftOrder === null
          && prodDowntime.startedAt >= orderStartedAt
          && prodDowntime.startedAt < orderFinishedAt)
        {
          prodDowntime.set(downtimeChanges);
          prodDowntime.save(this.parallel());
        }
      }
    },
    function recalcOrderDurationsStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to update downtimes after adding order [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      this.prodShiftOrder.recalcDurations(true, this.next());
    },
    function handleRecalcDurationsResultStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to recalc durations after adding order [%s] (LOG=[%s]): %s",
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
