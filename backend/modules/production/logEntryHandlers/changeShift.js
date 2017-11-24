// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdShift = mongoose.model('ProdShift');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const ProdDowntime = mongoose.model('ProdDowntime');

  step(
    function findOrdersAndDowntimesToFinishStep()
    {
      const conditions = {
        startedAt: {$gt: Date.now() - 7 * 24 * 3600 * 1000},
        prodLine: prodLine._id,
        finishedAt: null
      };

      ProdShiftOrder.find(conditions).exec(this.parallel());
      ProdDowntime.find(conditions).exec(this.parallel());
    },
    function finishOrdersAndDowntimesStep(err, prodShiftOrders, prodDowntimes)
    {
      if (err)
      {
        return productionModule.error(
          'Failed to find unfinished orders and downtimes for prod line [%s] (LOG=[%s]): %s',
          prodLine._id,
          logEntry._id,
          err.stack
        );
      }

      if (prodShiftOrders.length === 0 && prodDowntimes.length === 0)
      {
        return;
      }

      productionModule.debug(
        'Finishing %d bugged prod shift orders and %d bugged prod downtimes for prod line [%s]'
          + ' (LOG=[%s])...',
        prodShiftOrders.length,
        prodDowntimes.length,
        prodLine._id,
        logEntry._id
      );

      step(
        function()
        {
          for (let i = 0, l = prodDowntimes.length; i < l; ++i)
          {
            finishBugged('prod downtime', prodDowntimes[i], this.group());
          }
        },
        function()
        {
          for (let i = 0, l = prodShiftOrders.length; i < l; ++i)
          {
            finishBugged('prod shift order', prodShiftOrders[i], this.group());
          }
        },
        this.next()
      );
    },
    function findProdShiftsToRecalcStep()
    {
      ProdShift.find({shutdown: -1, prodLine: prodLine._id}).exec(this.next());
    },
    function recalcProdShiftsStep(err, prodShifts)
    {
      if (err)
      {
        return productionModule.error(
          'Failed to find shifts to recalc for prod line [%s] (LOG=[%s]): %s',
          prodLine._id,
          logEntry._id,
          err.stack
        );
      }

      const cachedProdShiftModels = [];

      productionModule.swapToCachedProdData(prodShifts, cachedProdShiftModels);

      for (let i = 0; i < cachedProdShiftModels.length; ++i)
      {
        cachedProdShiftModels[i].recalcTimes(this.group());
      }
    },
    function createProdShiftStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to recalc shift times for prod line [%s] (LOG=[%s]): %s',
          prodLine._id,
          logEntry._id,
          err.stack
        );
      }

      const prodShift = new ProdShift(logEntry.data.startedProdShift);

      prodShift.idle = -1;
      prodShift.working = -1;
      prodShift.downtime = -1;
      prodShift.startup = -1;
      prodShift.shutdown = -1;

      prodShift.save(this.next());
    },
    function handleCreatedProdShiftStep(err, prodShift)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          'Failed to save a new prod shift [%s] for prod line [%s] (LOG=[%s]): %s',
          logEntry.prodShift,
          prodLine._id,
          logEntry._id,
          err.stack
        );

        return done(err);
      }

      if (!err)
      {
        productionModule.setProdData(prodShift);
      }

      if (prodLine.isNew || !prodShift)
      {
        return done();
      }

      prodLine.set({
        prodShift: prodShift._id,
        prodShiftOrder: null,
        prodDowntime: null
      });

      prodLine.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            'Failed to save prod line [%s] after changing the shift (LOG=[%s]): %s',
            prodLine._id,
            logEntry._id,
            err.stack
          );
        }

        return done(err);
      });
    }
  );

  function finishBugged(type, buggedProdModel, done)
  {
    const _id = buggedProdModel._id;

    productionModule.getProdData(null, _id, function(err, cachedProdModel)
    {
      if (!err && cachedProdModel)
      {
        buggedProdModel = cachedProdModel;
      }

      buggedProdModel.finishedAt = new Date(buggedProdModel.date.getTime() + (8 * 3600 * 1000) - 1);

      if (buggedProdModel.recalcDurations)
      {
        buggedProdModel.recalcDurations(true, finalizeBugged.bind(null, type, buggedProdModel, done));
      }
      else
      {
        buggedProdModel.save(finalizeBugged.bind(null, type, buggedProdModel, done));
      }
    });
  }

  function finalizeBugged(type, prodModel, done, err)
  {
    if (err)
    {
      productionModule.error(
        'Failed to save finished, bugged %s [%s] for prod line [%s] (LOG=[%s]): %s',
        type,
        prodModel._id,
        prodLine._id,
        logEntry._id,
        err.stack
      );
    }
    else
    {
      productionModule.debug(
        'Finished bugged %s [%s] in shift [%s] of prod line [%s] (LOG=[%s])',
        type,
        prodModel._id,
        prodModel.prodShift,
        prodLine._id,
        logEntry._id
      );
    }

    return done();
  }
};
