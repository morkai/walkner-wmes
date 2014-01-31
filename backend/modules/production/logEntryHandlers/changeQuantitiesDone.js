'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod shift to change the quantities done (LOG=[%s]): %s",
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodShift)
    {
      return done(null);
    }

    prodShift.quantitiesDone[logEntry.data.hour].actual = Math.max(logEntry.data.newValue, 0);

    prodShift.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save the prod shift after changing the quantities done (LOG=[%s]): %s",
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
