// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var ProdDowntime = app[productionModule.config.mongooseId].model('ProdDowntime');

  if (logEntry.data.date === undefined || logEntry.data.operators === undefined)
  {
    productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
    {
      if (err)
      {
        productionModule.error(
          "Failed to get prod shift [%s] to start a downtime (LOG=[%s]): %s",
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );

        return done(err);
      }

      if (prodShift)
      {
        logEntry.data.date = prodShift.date;
        logEntry.data.shift = prodShift.shift;
        logEntry.data.operators = prodShift.operators;
      }

      createProdDowntime();
    });
  }
  else
  {
    createProdDowntime();
  }

  function createProdDowntime()
  {
    var prodDowntime = new ProdDowntime(logEntry.data);

    step(
      function findProdShiftOrderStep()
      {
        if (logEntry.data.prodShiftOrder)
        {
          productionModule.getProdData('order', logEntry.data.prodShiftOrder, this.next());
        }
      },
      function saveProdDowntimeStep(err, prodShiftOrder)
      {
        if (err)
        {
          productionModule.error("Failed to find order of a new downtime (LOG=[%s]): %s", logEntry._id, err.stack);

          return this.done(done, err);
        }

        prodDowntime.workerCount = prodShiftOrder ? prodShiftOrder.workerCount : 1;

        prodDowntime.save(this.next());
      },
      function updateProdLineStep(err)
      {
        if (err && err.code !== 11000)
        {
          productionModule.error("Failed to save a new prod downtime (LOG=[%s]): %s", logEntry._id, err.stack);

          return this.done(done, err);
        }

        if (!err)
        {
          productionModule.setProdData(prodDowntime);
        }

        if (prodLine.isNew)
        {
          return this.done(done);
        }

        prodLine.prodDowntime = prodDowntime._id;

        prodLine.save(this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save prod line [%s] after changing the prod downtime [%s] (LOG=[%s]): %s",
            prodLine._id,
            prodDowntime._id,
            logEntry._id,
            err.stack
          );
        }

        done(err);
      }
    );
  }
};
