// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var ProdDowntime = app[productionModule.config.mongooseId].model('ProdDowntime');

  productionModule.getProdData('order', logEntry.prodShiftOrder, function(err, prodShiftOrder)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod shift order [%s] to correct (LOG=[%s]): %s",
        logEntry.prodShiftOrder,
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      productionModule.warn(
        "Couldn't find prod shift order [%s] to correct (LOG=[%s])",
        logEntry.prodShiftOrder,
        logEntry._id
      );

      return done();
    }

    if (util.isOfflineEntry(logEntry))
    {
      util.fillOrderData(
        app, productionModule, logEntry, correctProdShiftOrder.bind(null, prodShiftOrder)
      );
    }
    else
    {
      correctProdShiftOrder(prodShiftOrder, null);
    }
  });

  function correctProdShiftOrder(prodShiftOrder, err)
  {
    if (err)
    {
      return done(err);
    }

    prodShiftOrder.set(logEntry.data);

    prodShiftOrder.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod shift order [%s] after correcting it (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return done(err);
      }

      return correctProdDowntimes();
    });
  }

  function correctProdDowntimes()
  {
    var query = ProdDowntime.find({prodShiftOrder: logEntry.prodShiftOrder}, {_id: 1}).lean();

    query.exec(function(err, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find prod downtimes after correcting prod shift order [%s] (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return done();
      }

      if (!prodDowntimes.length)
      {
        return done();
      }

      step(
        function correctProdDowntimesStep()
        {
          var step = this;

          prodDowntimes.forEach(function(prodDowntime)
          {
            correctProdDowntime(prodDowntime._id, step.parallel());
          });
        },
        done
      );
    });
  }

  function correctProdDowntime(prodDowntimeId, done)
  {
    productionModule.getProdData('downtime', prodDowntimeId, function(err, prodDowntime)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find prod downtime [%s] after correcting prod shift order [%s]"
            + " (LOG=[%s]): %s",
          prodDowntimeId,
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return done();
      }

      var changes = {
        mechOrder: !!logEntry.data.mechOrder,
        orderId: logEntry.data.orderId,
        operationNo: logEntry.data.operationNo
      };

      prodDowntime.set(changes);
      prodDowntime.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save prod downtime [%s] after correcting prod shift order [%s]"
              + " (LOG=[%s]): %s",
            prodDowntimeId,
            logEntry.prodShiftOrder,
            logEntry._id,
            err.stack
          );
        }

        return done();
      });
    });
  }
};
