'use strict';

var util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  if (logEntry.data.master === undefined)
  {
    copyPersonnelData();
  }
  else
  {
    handleOfflineEntry();
  }

  function copyPersonnelData()
  {
    productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find prod shift [%s] to copy personnel data (LOG=[%s]): %s",
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );
      }
      else if (prodShift)
      {
        logEntry.data.master = prodShift.master;
        logEntry.data.leader = prodShift.leader;
        logEntry.data.operator = prodShift.operator;
        logEntry.data.operators = prodShift.operators;
      }

      return handleOfflineEntry();
    });
  }

  function handleOfflineEntry()
  {
    if (util.isOfflineEntry(logEntry))
    {
      util.fillOrderData(app, productionModule, logEntry, createProdShiftOrder);
    }
    else
    {
      createProdShiftOrder();
    }
  }

  function createProdShiftOrder(err)
  {
    if (err)
    {
      return done(err);
    }

    var prodShiftOrder = new ProdShiftOrder(logEntry.data);

    prodShiftOrder.save(function(err)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          "Failed to save a new prod shift order (LOG=[%s]): %s", logEntry._id, err.stack
        );

        return done(err);
      }

      if (!err)
      {
        productionModule.setProdData(prodShiftOrder);
      }

      if (prodLine.isNew)
      {
        return done();
      }

      prodLine.set({
        prodShiftOrder: prodShiftOrder._id,
        prodDowntime: null
      });

      prodLine.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save prod line [%s] after changing the prod shift order to [%s]"
              + " (LOG=[%s]): %s",
            prodLine._id,
            prodShiftOrder._id,
            logEntry._id,
            err.stack
          );
        }

        return done(err);
      });
    });
  }
};
