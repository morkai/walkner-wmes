// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  step(
    function findProdShiftOrderStep()
    {
      productionModule.getProdData('order', logEntry.prodShiftOrder, this.next());
    },
    function setWorkerCountStep(err, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          'Failed to get prod shift order [%s] to change the worker count (LOG=[%s]): %s',
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (!prodShiftOrder)
      {
        productionModule.warn(
          "Couldn't find prod shift order [%s] to change the worker count (LOG=[%s])",
          logEntry.prodShiftOrder,
          logEntry._id
        );

        return this.done(done);
      }

      prodShiftOrder.workerCount = Math.max(logEntry.data.newValue, 0);

      if (logEntry.data.sapTaktTime >= 0)
      {
        prodShiftOrder.sapTaktTime = logEntry.data.sapTaktTime;
      }

      this.prodShiftOrder = prodShiftOrder;
    },
    function findProdDowntimesStep()
    {
      productionModule.getOrderDowntimes(this.prodShiftOrder._id, this.next());
    },
    function saveModelsStep(err, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          'Failed to get downtimes for order [%s] to change the worker count (LOG=[%s]): %s',
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      this.prodShiftOrder.save(this.group());

      for (let i = 0; i < prodDowntimes.length; ++i)
      {
        const prodDowntime = prodDowntimes[i];

        prodDowntime.workerCount = this.prodShiftOrder.workerCount;
        prodDowntime.save(this.group());
      }
    },
    function finalizeStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to save models after changing the worker count of order [%s] (LOG=[%s]): %s',
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );
      }

      this.prodShiftOrder = null;

      return done(err);
    }
  );
};
