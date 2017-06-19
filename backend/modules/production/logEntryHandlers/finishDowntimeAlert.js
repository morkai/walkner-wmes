// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const logData = logEntry.data;

  step(
    function()
    {
      productionModule.getProdData('downtime', logData.downtimeId, this.next());
    },
    function(err, prodDowntime)
    {
      if (err)
      {
        productionModule.error(
          'Failed to find prod downtime [%s] to finish alert [%s] (LOG=[%s]): %s',
          logData.downtimeId,
          logData.alertId,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (!prodDowntime)
      {
        productionModule.warn(
          "Couldn't find prod downtime [%s] to finish alert [%s] (LOG=[%s])",
          logData.downtimeId,
          logData.alertId,
          logEntry._id
        );

        return this.done(done);
      }

      const alert = _.find(prodDowntime.alerts, '_id', logData.alertId);

      if (!alert)
      {
        productionModule.warn(
          "Tried to finish alert [%s] that wasn't started (downtime=[%s] LOG=[%s])",
          logData.alertId,
          logData.downtimeId,
          logEntry._id
        );

        return done();
      }

      if (!alert.active)
      {
        productionModule.warn(
          'Tried to finish alert [%s] that was already finished (downtime=[%s] LOG=[%s])',
          logData.alertId,
          logData.downtimeId,
          logEntry._id
        );

        return done();
      }

      alert.active = false;

      prodDowntime.changes.push({
        date: logEntry.createdAt,
        user: logEntry.creator,
        data: {
          alert: {
            _id: alert._id,
            name: alert.name
          }
        },
        comment: 'WMES:ALERTS:FINISH'
      });

      prodDowntime.save(this.next());
    },
    function(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to save prod downtime [%s] after finishing alert [%s] (LOG=[%s]): %s',
          logData.downtimeId,
          logData.alertId,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    }
  );
};
