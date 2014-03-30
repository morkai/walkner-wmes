'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('order', logEntry.prodShiftOrder, function(err, prodShiftOrder)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get prod shift order [%s] to change the worker count (LOG=[%s]): %s",
        logEntry.prodShiftOrder,
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      productionModule.warn(
        "Couldn't find prod shift order [%s] to change the worker count (LOG=[%s])",
        logEntry.prodShiftOrder,
        logEntry._id
      );

      return done();
    }

    prodShiftOrder.workerCount = Math.max(logEntry.data.newValue, 0);

    prodShiftOrder.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod shift order [%s] after changing the worker count (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
