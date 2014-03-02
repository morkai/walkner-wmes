'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('downtime', logEntry.data._id, function(err, prodDowntime)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get a prod downtime to corroborate (LOG=[%s]): %s", logEntry._id, err.stack
      );

      return done(err);
    }

    if (!prodDowntime)
    {
      productionModule.warn(
        "Couldn't find a prod downtime to corroborate (LOG=[%s])", logEntry._id
      );

      return done();
    }

    prodDowntime.set(logEntry.data);
    prodDowntime.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save a prod downtime after corroborating (LOG=[%s]): %s",
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
