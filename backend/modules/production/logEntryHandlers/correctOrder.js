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
        "Failed to get the prod shift order to correct (LOG=[%s]): %s", logEntry._id, err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      return done(null);
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
          "Failed to save the prod shift order after correcting it (LOG=[%s]): %s",
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
          "Failed to find prod downtimes after correcting the prod shift order (LOG=[%s]): %s",
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
          "Failed to find prod downtime [%s] after correcting the prod shift order (LOG=[%s]): %s",
          prodDowntimeId,
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
            "Failed to save prod downtime [%s] after correcting the prod shift order "
              + "(LOG=[%s]): %s",
            prodDowntimeId,
            logEntry._id,
            err.stack
          );
        }

        return done();
      });
    });
  }
};
