// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var logData = logEntry.data;

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
          "Failed to find prod downtime [%s] to record alert action [%s] (LOG=[%s]): %s",
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
          "Couldn't find prod downtime [%s] to record alert action [%s] (LOG=[%s])",
          logData.downtimeId,
          logData.alertId,
          logEntry._id
        );

        return this.done(done);
      }

      setImmediate(this.next(), null, prodDowntime);
    },
    function(err, prodDowntime)
    {
      var alert = _.find(prodDowntime.alerts, '_id', logData.alertId);

      if (alert && !alert.active)
      {
        productionModule.warn(
          "Tried to record action of an already finished alert [%s] (downtime=[%s] LOG=[%s])",
          logData.alertId,
          logData.downtimeId,
          logEntry._id
        );

        return done();
      }

      var isNew = !alert;

      if (isNew)
      {
        alert = {
          _id: logData.alertId,
          name: logData.alertName,
          action: logData.action,
          active: true
        };

        prodDowntime.alerts.push(alert);
      }
      else
      {
        alert.action = logData.action;
      }

      if (isNew || !_.isEmpty(logData.recipients))
      {
        prodDowntime.changes.push({
          date: logEntry.createdAt,
          user: logEntry.creator,
          data: {
            alert: {
              _id: alert._id,
              name: alert.name,
              recipients: logData.recipients
            }
          },
          comment: 'WMES:ALERTS:' + (isNew ? 'START' : 'NOTIFY')
        });
      }

      prodDowntime.save(this.next());
    },
    function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod downtime [%s] after recording alert action (alert=[%s] LOG=[%s]): %s",
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
