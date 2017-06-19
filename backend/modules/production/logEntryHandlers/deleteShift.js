// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const ProdDowntime = mongoose.model('ProdDowntime');

  step(
    function getProdDowntimeModelStep()
    {
      productionModule.getProdData('shift', logEntry.prodShift, this.parallel());
      ProdShiftOrder.find({prodShift: logEntry.prodShift}, this.parallel());
      ProdDowntime.find({prodShift: logEntry.prodShift}, this.parallel());
    },
    function swapToCachedModelsStep(err, prodShift, prodShiftOrders, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          'Failed to find models while deleting shift [%s] (LOG=[%s]): %s',
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      const cachedProdShiftOrders = [];
      const cachedProdDowntimes = [];

      if (Array.isArray(prodShiftOrders))
      {
        productionModule.swapToCachedProdData(prodShiftOrders, cachedProdShiftOrders);
      }

      if (Array.isArray(prodDowntimes))
      {
        productionModule.swapToCachedProdData(prodDowntimes, cachedProdDowntimes);
      }

      setImmediate(this.next().bind(null, prodShift, cachedProdShiftOrders, cachedProdDowntimes));
    },
    function deleteModelsStep(prodShift, prodShiftOrders, prodDowntimes)
    {
      this.prodShift = prodShift;
      this.prodShiftOrders = prodShiftOrders;
      this.prodDowntimes = prodDowntimes;

      prodShift.remove(this.parallel());

      let i;
      let l;

      for (i = 0, l = prodShiftOrders.length; i < l; ++i)
      {
        prodShiftOrders[i].remove(this.parallel());
      }

      for (i = 0, l = prodDowntimes.length; i < l; ++i)
      {
        prodDowntimes[i].remove(this.parallel());
      }
    },
    function broadcastStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to delete shift [%s] (LOG=[%s]): %s',
          this.prodShift._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      if (!productionModule.recreating)
      {
        app.broker.publish('prodShifts.deleted.' + this.prodShift._id, {
          _id: this.prodShift._id,
          prodLine: this.prodShift.prodLine,
          date: this.prodShift.date,
          shift: this.prodShift.shift
        });

        let i;
        let l;

        for (i = 0, l = this.prodShiftOrders.length; i < l; ++i)
        {
          const prodShiftOrder = this.prodShiftOrders[i];

          app.broker.publish('prodShiftOrders.deleted.' + prodShiftOrder._id, {
            _id: prodShiftOrder._id,
            prodShift: prodShiftOrder.prodShift,
            prodLine: prodShiftOrder.prodLine,
            orderId: prodShiftOrder.orderId,
            operationNo: prodShiftOrder.operationNo,
            shift: prodShiftOrder.shift
          });
        }

        for (i = 0, l = this.prodDowntimes.length; i < l; ++i)
        {
          const prodDowntime = this.prodDowntimes[i];

          app.broker.publish('prodDowntimes.deleted.' + prodDowntime._id, {
            _id: prodDowntime._id,
            rid: prodDowntime.rid,
            prodLine: prodDowntime.prodLine,
            prodShift: prodDowntime.prodShift,
            prodShiftOrder: prodDowntime.prodShiftOrder
          });
        }
      }
    },
    done
  );
};
