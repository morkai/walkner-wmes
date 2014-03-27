'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var ProdLogEntry = app[productionModule.config.mongooseId].model('ProdLogEntry');

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
        .find({prodLine: prodLine._id, finishedAt: null})
        .sort({startedAt: -1})
        .limit(1)
        .exec(function(err, prodDowntimes)
        {
          if (err)
          {
            productionModule.error(
              "Failed to find the last prod downtime for the prod line [%s] (LOG=[%s]): %s",
              prodLine._id,
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
    if (prodDowntime.finishedAt
      && prodDowntime.finishedAt <= Date.parse(logEntry.data.finishedAt))
    {
      productionModule.warn(
        "Tried to finish an already finished prod downtime (LOG=[%s])", logEntry._id
      );

      return done();
    }

    prodDowntime.set('finishedAt', logEntry.data.finishedAt);

    var downtimeReason =
      app[productionModule.config.downtimeReasonsId].modelsById[prodDowntime.reason];
    var corroborated = null;

    if (!productionModule.recreating
      && prodDowntime.status === 'undecided'
      && downtimeReason
      && downtimeReason.auto)
    {
      corroborated = {
        status: 'confirmed',
        corroborator: {
          id: null,
          ip: '127.0.0.1',
          cname: 'LOCALHOST',
          label: 'System'
        },
        corroboratedAt: new Date(logEntry.savedAt.getTime() + 1)
      };

      prodDowntime.set(corroborated);

      corroborated._id = prodDowntime._id;

      var createdAt = new Date(logEntry.createdAt.getTime() + 1);
      var corroborateLogEntry = new ProdLogEntry({
        _id: ProdLogEntry.generateId(createdAt, logEntry.prodShift),
        type: 'corroborateDowntime',
        data: corroborated,
        division: logEntry.division,
        subdivision: logEntry.subdivision,
        mrpControllers: logEntry.mrpControllers,
        prodFlow: logEntry.prodFlow,
        workCenter: logEntry.workCenter,
        prodLine: logEntry.prodLine,
        prodShift: logEntry.prodShift,
        prodShiftOrder: logEntry.prodShiftOrder,
        creator: corroborated.corroborator,
        createdAt: createdAt,
        savedAt: corroborated.corroboratedAt,
        todo: false
      });
      corroborateLogEntry.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to create a ProdLogEntry during auto corroboration of the "
              + "[%s] ProdDowntime (LOG=[%s]): %s",
            prodDowntime._id,
            logEntry._id,
            err.stack
          );
        }
      });
    }

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
        app.broker.publish('prodDowntimes.finished.' + prodLine._id, logEntry.data);
      }

      if (corroborated)
      {
        app.broker.publish('prodDowntimes.corroborated.' + prodLine._id, corroborated);
      }

      return done(err);
    });
  }
};
