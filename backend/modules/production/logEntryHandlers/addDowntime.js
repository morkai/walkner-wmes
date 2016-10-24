// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');
var util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');

  var prodDowntime = new ProdDowntime(logEntry.data);

  step(
    function findProdShiftOrderStep()
    {
      if (prodDowntime.prodShiftOrder)
      {
        productionModule.getProdData('order', prodDowntime.prodShiftOrder, this.parallel());
      }
    },
    function saveProdDowntimeStep(err, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error("Failed to find order for a new downtime [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      this.prodShiftOrder = prodShiftOrder;

      prodDowntime.workerCount = prodShiftOrder ? prodShiftOrder.workerCount : 1;
      prodDowntime.orderData = ProdDowntime.getOrderData(prodShiftOrder);
      prodDowntime.save(this.next());
    },
    function recalcOrderDurationsStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save a new downtime [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (this.prodShiftOrder)
      {
        this.prodShiftOrder.recalcDurations(true, this.next());
      }
    },
    util.createRecalcShiftTimesStep(productionModule, logEntry),
    function finalizeStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to recalc durations for order [%s] after adding a downtime [%s] (LOG=[%s]): %s",
          prodDowntime.prodShiftOrder,
          prodDowntime._id,
          logEntry._id,
          err.stack
        );
      }

      this.prodShiftOrder = null;

      return done(err);
    }
  );
};
