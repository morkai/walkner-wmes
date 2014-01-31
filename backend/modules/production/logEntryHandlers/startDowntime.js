'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var ProdDowntime = app[productionModule.config.mongooseId].model('ProdDowntime');

  if (!logEntry.data.creator)
  {
    logEntry.data.creator = logEntry.creator;
  }

  // TODO: Remove after a while
  if (!logEntry.data.date || !logEntry.data.shift)
  {
    productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
    {
      if (err)
      {
        productionModule.error(
          "Failed to get a prod shift to start a downtime (LOG=[%s]): %s", logEntry._id, err.stack
        );

        return done(err);
      }

      logEntry.data.date = prodShift.date;
      logEntry.data.shift = prodShift.shift;

      createProdDowntime();
    });
  }
  else
  {
    createProdDowntime();
  }

  function createProdDowntime()
  {
    var prodDowntime = new ProdDowntime(logEntry.data);

    prodDowntime.save(function(err)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          "Failed to save a new prod downtime (LOG=[%s]): %s", logEntry._id, err.stack
        );

        return done(err);
      }

      productionModule.setProdData(prodDowntime);

      prodLine.set('prodDowntime', prodDowntime.get('_id'));

      prodLine.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save the prod line after changing the prod downtime (LOG=[%s]): %s",
            logEntry._id,
            err.stack
          );
        }
        else
        {
          app.broker.publish('prodDowntimes.created.' + prodLine.get('_id'), prodDowntime.toJSON());
        }

        done(err);
      });
    });
  }
};
