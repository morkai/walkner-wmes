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
          "Failed to get the prod shift [%s] to start downtime [%s]: %s",
          logEntry.prodShift,
          logEntry.data._id,
          err.stack
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
          "Failed to save a new prod downtime [%s] for prod line [%s]: %s",
          prodDowntime.get('_id'),
          prodLine.get('_id'),
          err.stack
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
            "Failed to save the prod line [%s] after changing the prod downtime to [%s]: %s",
            prodLine.get('_id'),
            prodDowntime.get('_id'),
            err.stack
          );
        }

        done(err);
      });
    });
  }
};
