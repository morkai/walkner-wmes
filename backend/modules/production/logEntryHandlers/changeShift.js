// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');

  step(
    function findOrdersAndDowntimesToFinishStep()
    {
      var conditions = {
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
          "Failed to find unfinished orders and downtimes for prod line [%s] (LOG=[%s]): %s",
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
        "Finishing %d bugged prod shift orders and %d bugged prod downtimes for prod line [%s]"
          + " (LOG=[%s])...",
        prodShiftOrders.length,
        prodDowntimes.length,
        prodLine._id,
        logEntry._id
      );

      step(
        function()
        {
          for (var i = 0, l = prodDowntimes.length; i < l; ++i)
          {
            finishBugged('prod downtime', prodDowntimes[i], this.parallel());
          }
        },
        function()
        {
          for (var i = 0, l = prodShiftOrders.length; i < l; ++i)
          {
            finishBugged('prod shift order', prodShiftOrders[i], this.parallel());
          }
        },
        this.next()
      );
    },
    function createProdShiftStep()
    {
      var prodShift = new ProdShift(logEntry.data.startedProdShift);

      prodShift.save(this.next());
    },
    function handleCreatedProdShiftStep(err, prodShift)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          "Failed to save a new prod shift [%s] for prod line [%s] (LOG=[%s]): %s",
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
            "Failed to save prod line [%s] after changing the shift (LOG=[%s]): %s",
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
    var _id = buggedProdModel._id;

    productionModule.getProdData(null, _id, function(err, cachedProdModel)
    {
      if (cachedProdModel)
      {
        buggedProdModel = cachedProdModel;
      }

      buggedProdModel.finishedAt = new Date(buggedProdModel.date.getTime() + (8 * 3600 * 1000) - 1);

      buggedProdModel.recalcDurations(true, function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save finished, bugged %s [%s] for prod line [%s] (LOG=[%s]): %s",
            type,
            _id,
            prodLine._id,
            logEntry._id,
            err.stack
          );
        }
        else
        {
          productionModule.debug(
            "Finished bugged %s [%s] in shift [%s] of prod line [%s] (LOG=[%s])",
            type,
            _id,
            buggedProdModel.prodShift,
            prodLine._id,
            logEntry._id
          );
        }

        return done();
      });
    });
  }
};
