'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('downtime', logEntry.data._id, function(err, prodDowntime)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod downtime to finish (LOG=[%s]): %s", logEntry._id, err.stack
      );

      return done(err);
    }

    if (!prodDowntime)
    {
      // TODO: Remove after a while
      app[productionModule.config.mongooseId]
        .model('ProdDowntime')
        .find({prodLine: prodLine.get('_id'), finishedAt: null})
        .sort({startedAt: -1})
        .limit(1)
        .exec(function(err, prodDowntimes)
        {
          if (err)
          {
            productionModule.error(
              "Failed to find the last prod downtime for the prod line [%s] (LOG=[%s]): %s",
              prodLine.get('_id'),
              logEntry._id,
              err.stack
            );

            return done(err);
          }

          var prodDowntime = prodDowntimes[0];

          if (!prodDowntime)
          {
            return done(null);
          }

          productionModule.setProdData(prodDowntime);

          finishDowntime(prodDowntime);
        });
    }
    else
    {
      finishDowntime(prodDowntime);
    }
  });

  function finishDowntime(prodDowntime)
  {
    prodDowntime.set('finishedAt', logEntry.data.finishedAt);

    prodDowntime.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save the prod downtime after changing the finish time (LOG=[%s]): %s",
          logEntry._id,
          err.stack
        );
      }
      else
      {
        app.broker.publish('prodDowntimes.finished.' + prodLine.get('_id'), logEntry.data);
      }

      return done(err);
    });
  }
};
