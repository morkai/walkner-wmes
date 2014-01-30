'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var ProdShiftOrder = app[productionModule.config.mongooseId].model('ProdShiftOrder');

  if (!logEntry.data.creator)
  {
    logEntry.data.creator = logEntry.creator;
  }

  var prodShiftOrder = new ProdShiftOrder(logEntry.data);

  prodShiftOrder.save(function(err)
  {
    if (err && err.code !== 11000)
    {
      productionModule.error(
        "Failed to save a new prod shift order [%s] for prod line [%s]: %s",
        prodShiftOrder.get('_id'),
        prodLine.get('_id'),
        err.stack
      );

      return done(err);
    }

    productionModule.setProdData(prodShiftOrder);

    prodLine.set({
      prodShiftOrder: prodShiftOrder.get('_id'),
      prodDowntime: null
    });

    prodLine.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save the prod line [%s] after changing the prod shift order to [%s]: %s",
          prodLine.get('_id'),
          prodShiftOrder.get('_id'),
          err.stack
        );
      }

      return done(err);
    });
  });
};
