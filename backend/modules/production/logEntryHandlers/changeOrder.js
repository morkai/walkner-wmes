'use strict';

var util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  if (!logEntry.data.creator)
  {
    logEntry.data.creator = logEntry.creator;
  }

  if (util.isOfflineEntry(logEntry))
  {
    util.fillOrderData(app, productionModule, logEntry, createProdShiftOrder);
  }
  else
  {
    createProdShiftOrder();
  }

  function createProdShiftOrder(err)
  {
    if (err)
    {
      return done(err);
    }

    var prodShiftOrder = new ProdShiftOrder(logEntry.data);

    prodShiftOrder.set('laborTime', util.getLaborTime(prodShiftOrder));

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
        prodShiftOrder: prodShiftOrder.get('_id'),
        prodDowntime: null
      });

      prodLine.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save the prod line after changing the prod shift order (LOG=[%s]): %s",
            logEntry._id,
            err.stack
          );
        }

        return done(err);
      });
    });
  }
};
