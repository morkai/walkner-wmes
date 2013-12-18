'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShift = mongoose.model('ProdShift');

  var startedProdShiftData = logEntry.data.startedProdShift;

  if (!startedProdShiftData.creator)
  {
    startedProdShiftData.creator = logEntry.creator;
  }

  finishOrders();

  // TODO: Remove after a while
  function finishOrders()
  {
    mongoose.model('ProdShiftOrder')
      .find({prodLine: prodLine.get('_id'), finishedAt: null})
      .sort({date: 1})
      .exec(function(err, prodShiftOrders)
      {
        if (err)
        {
          productionModule.error(
            "Failed to find unfinished prod shift orders for prod line [%s]: %s",
            prodLine.get('_id'),
            err.stack
          );

          return createNewShift();
        }

        if (prodShiftOrders.length === 0)
        {
          return createNewShift();
        }

        productionModule.debug(
          "Finishing %d bugged prod shift orders for prod line [%s]...",
          prodShiftOrders.length,
          prodLine.get('_id')
        );

        step(
          function finishOrdersStep()
          {
            var step = this;

            prodShiftOrders.forEach(function(prodShiftOrder)
            {
              finishOrder(prodShiftOrder, step.parallel());
            });
          },
          createNewShift
        );
      });
  }

  function finishOrder(prodShiftOrder, done)
  {
    var _id = prodShiftOrder.get('_id');

    productionModule.getProdData(null, _id, function(err, cachedProdShiftOrder)
    {
      if (cachedProdShiftOrder)
      {
        prodShiftOrder = cachedProdShiftOrder;
      }

      // End of shift
      var finishedAt = prodShiftOrder.get('date').getTime() + (8 * 3600 * 1000) - 1;

      prodShiftOrder.set('finishedAt', new Date(finishedAt));

      prodShiftOrder.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save finished prod shift order [%s] for prod line [%s]: %s",
            _id,
            prodLine.get('_id'),
            err.stack
          );
        }

        return done();
      });
    });
  }

  function createNewShift()
  {
    var prodShift = new ProdShift(startedProdShiftData);

    prodShift.save(function(err)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          "Failed to save a new prod shift [%s] for prod line [%s]: %s",
          prodShift.get('_id'),
          prodLine.get('_id'),
          err.stack
        );

        return done(err);
      }

      productionModule.setProdData(prodShift);

      prodLine.set({
        prodShift: prodShift.get('_id'),
        prodShiftOrder: null,
        prodDowntime: null
      });

      prodLine.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save the prod line [%s] after changing the shift to [%s]: %s",
            prodLine.get('_id'),
            prodShift.get('_id'),
            err.stack
          );
        }

        return done(err);
      });
    });
  }
};
