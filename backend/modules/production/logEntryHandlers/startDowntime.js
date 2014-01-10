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
        else
        {
          app.broker.publish('prodDowntimes.created.' + prodLine.get('_id'), prodDowntime.toJSON());
        }

        // TODO: Remove after a while
        fixOrgUnits(prodDowntime);

        done(err);
      });
    });
  }

  function fixOrgUnits(prodDowntime)
  {
    var prodLine = prodDowntime.get('prodLine');
    var conditions = {
      prodLine: prodLine,
      workCenter: null
    };
    var update = {
      $set: {
        division: prodDowntime.get('division'),
        subdivision: prodDowntime.get('subdivision'),
        mrpControllers: prodDowntime.get('mrpControllers'),
        prodFlow: prodDowntime.get('prodFlow'),
        workCenter: prodDowntime.get('workCenter')
      }
    };
    var options = {
      multi: true
    };

    ProdDowntime.update(conditions, update, options, function(err, count)
    {
      if (err)
      {
        productionModule.error(
          "Failed to update org units of prod downtimes for prod line [%s]: %s",
          prodLine,
          err.stack
        );
      }
      else if (count > 0)
      {
        productionModule.debug(
          "Updated [%d] org units of prod downtimes for prod line [%s].", count, prodLine
        );
      }
    });
  }
};
