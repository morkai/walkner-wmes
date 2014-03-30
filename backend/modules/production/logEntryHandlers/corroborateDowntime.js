'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('downtime', logEntry.data._id, function(err, prodDowntime)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get prod downtime [%s] to corroborate (LOG=[%s]): %s",
        logEntry.data._id,
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodDowntime)
    {
      productionModule.warn(
        "Couldn't find prod downtime [%s] to corroborate (LOG=[%s])",
        logEntry.data._id,
        logEntry._id
      );

      return done();
    }

    prodDowntime.set(logEntry.data);
    prodDowntime.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod downtime [%s] after corroborating (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
