'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');

  finishOrders();

  function finishOrders()
  {
    ProdShiftOrder
      .find({prodLine: prodLine._id, finishedAt: null})
      .sort({date: 1})
      .exec(function(err, prodShiftOrders)
      {
        if (err)
        {
          productionModule.error(
            "Failed to find unfinished prod shift orders for prod line [%s] (LOG=[%s]): %s",
            prodLine._id,
            logEntry._id,
            err.stack
          );

          return finishDowntimes();
        }

        if (prodShiftOrders.length === 0)
        {
          return finishDowntimes();
        }

        productionModule.debug(
          "Finishing %d bugged prod shift orders for prod line [%s] (LOG=[%s])...",
          prodShiftOrders.length,
          prodLine._id,
          logEntry._id
        );

        step(
          function finishOrdersStep()
          {
            var step = this;

            prodShiftOrders.forEach(function(prodShiftOrder)
            {
              finishBugged('prod shift order', prodShiftOrder, step.parallel());
            });
          },
          finishDowntimes
        );
      });
  }

  function finishDowntimes()
  {
    ProdDowntime
      .find({prodLine: prodLine._id, finishedAt: null})
      .sort({date: 1})
      .exec(function(err, prodDowntimes)
      {
        if (err)
        {
          productionModule.error(
            "Failed to find unfinished prod downtimes for prod line [%s] (LOG=[%s]): %s",
            prodLine._id,
            logEntry._id,
            err.stack
          );

          return createNewShift();
        }

        if (prodDowntimes.length === 0)
        {
          return createNewShift();
        }

        productionModule.debug(
          "Finishing %d bugged prod downtimes for prod line [%s] (LOG=[%s])...",
          prodDowntimes.length,
          prodLine._id,
          logEntry._id
        );

        step(
          function finishDowntimesStep()
          {
            var step = this;

            prodDowntimes.forEach(function(prodDowntime)
            {
              finishBugged('prod downtime', prodDowntime, step.parallel());
            });
          },
          createNewShift
        );
      });
  }

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

      buggedProdModel.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save finished %s [%s] for prod line [%s] (LOG=[%s]): %s",
            type,
            _id,
            prodLine._id,
            logEntry._id,
            err.stack
          );
        }

        return done();
      });
    });
  }

  function createNewShift()
  {
    var prodShift = new ProdShift(logEntry.data.startedProdShift);

    prodShift.save(function(err)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          "Failed to save a new prod shift [%s] for prod line [%s] (LOG=[%s]): %s",
          prodShift._id,
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

      if (prodLine.isNew)
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
    });
  }
};
