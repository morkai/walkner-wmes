'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('order', logEntry.data._id, function(err, prodShiftOrder)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod shift order [%s] to finish (LOG=[%s]): %s",
        logEntry.data._id,
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      productionModule.warn(
        "Couldn't find prod shift order [%s] to finish (LOG=[%s])",
        logEntry.data._id,
        logEntry._id
      );

      return done();
    }

    if (prodShiftOrder.finishedAt
      && prodShiftOrder.finishedAt <= Date.parse(logEntry.data.finishedAt))
    {
      productionModule.warn(
        "Tried to finish an already finished prod shift order [%s] (LOG=[%s])",
        logEntry.data._id,
        logEntry._id
      );

      return done();
    }

    prodShiftOrder.finishedAt = logEntry.data.finishedAt;

    prodShiftOrder.recalcDurations(false, function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to recalculate durations of prod shift order [%s] (LOG=[%s]): %s",
          prodShiftOrder._id,
          logEntry._id,
          err.stack
        );
      }

      prodShiftOrder.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save prod shift order [%s] after changing the finish time (LOG=[%s]): %s",
            prodShiftOrder._id,
            logEntry._id,
            err.stack
          );
        }

        return done(err);
      });
    });
  });
};
