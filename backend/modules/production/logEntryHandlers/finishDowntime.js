// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var ProdLogEntry = app[productionModule.config.mongooseId].model('ProdLogEntry');

  productionModule.getProdData('downtime', logEntry.data._id, function(err, prodDowntime)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get prod downtime [%s] to finish (LOG=[%s]): %s",
        logEntry.data._id,
        logEntry._id,
        err.stack
      );

      return done(err);
    }


    if (!prodDowntime)
    {
      productionModule.warn("Couldn't find prod downtime [%s] to finish (LOG=[%s])", logEntry.data._id, logEntry._id);

      return done();
    }
    else
    {
      finishDowntime(prodDowntime);
    }
  });

  function finishDowntime(prodDowntime)
  {
    if (prodDowntime.finishedAt && prodDowntime.finishedAt <= Date.parse(logEntry.data.finishedAt))
    {
      productionModule.warn(
        "Tried to finish an already finished prod downtime [%s] (LOG=[%s])",
        prodDowntime._id,
        logEntry._id
      );

      return done();
    }

    prodDowntime.finishedAt = logEntry.data.finishedAt;

    var downtimeReason = app[productionModule.config.downtimeReasonsId].modelsById[prodDowntime.reason];
    var corroborated = null;
    var changes = {};

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

      changes.date = corroborated.corroboratedAt;
      changes.user = corroborated.corroborator;
      changes.data = {status: [prodDowntime.status, corroborated.status]};
      changes.comment = '';

      prodDowntime.changes.push(changes);
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
            "Failed to create a ProdLogEntry during an auto corroboration of the prod downtime [%s] (LOG=[%s]): %s",
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
          "Failed to save prod downtime [%s] after changing the finish time (LOG=[%s]): %s",
          prodDowntime._id,
          logEntry._id,
          err.stack
        );
      }
      else
      {
        app.broker.publish('prodDowntimes.finished.' + prodLine._id + '.' + prodDowntime._id, logEntry.data);
      }

      if (corroborated)
      {
        corroborated.changes = changes;

        app.broker.publish('prodDowntimes.corroborated.' + prodLine._id + '.' + prodDowntime._id, corroborated);
      }

      return done(err);
    });
  }
};
