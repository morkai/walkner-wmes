// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('downtime', logEntry.data._id, function(err, prodDowntime)
  {
    if (err)
    {
      productionModule.error(
        'Failed to get prod downtime [%s] to corroborate (LOG=[%s]): %s',
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

    const logEntryData = logEntry.data;
    const changeData = {};

    _.forEach(['status', 'reason', 'aor'], function(property)
    {
      if (logEntryData[property] && String(logEntryData[property]) !== String(prodDowntime[property]))
      {
        changeData[property] = [prodDowntime[property], logEntryData[property]];
      }
    });

    const changes = {
      date: logEntryData.corroboratedAt,
      user: logEntryData.corroborator,
      data: changeData,
      comment: logEntryData.decisionComment || ''
    };

    prodDowntime.changes.push(changes);
    prodDowntime.set(logEntryData);
    prodDowntime.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to save prod downtime [%s] after corroborating (LOG=[%s]): %s',
          logEntry.data._id,
          logEntry._id,
          err.stack
        );
      }
      else
      {
        const corroborated = _.clone(logEntryData);
        corroborated.changes = changes;

        app.broker.publish('prodDowntimes.corroborated.' + prodLine._id + '.' + prodDowntime._id, corroborated);
      }

      return done(err);
    });
  });
};
