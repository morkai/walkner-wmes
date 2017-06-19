// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpAlertsClient(app, module)
{
  const fte = app[module.config.fteId];
  const messengerClient = app[module.config.messengerClientId];

  app.broker.subscribe('prodDowntimes.created.**', onDowntimeCreated);
  app.broker.subscribe('prodDowntimes.finished.**', onDowntimeFinished);
  app.broker.subscribe('prodDowntimeAlerts.added', onAlertChanged);
  app.broker.subscribe('prodDowntimeAlerts.edited', onAlertChanged);
  app.broker.subscribe('prodDowntimeAlerts.deleted', onAlertChanged);

  function onDowntimeCreated(prodDowntime)
  {
    if (_.isDate(prodDowntime.date) && prodDowntime.date.getTime() === fte.currentShift.date.getTime())
    {
      const data = {
        prodDowntimeId: prodDowntime._id
      };

      if (messengerClient)
      {
        messengerClient.request('downtimeStarted', data, _.noop);
      }
      else
      {
        app.broker.publish('prodDowntimeAlerts.downtimeStarted', data);
      }
    }
  }

  function onDowntimeFinished(changes)
  {
    const finishedAt = Date.parse(changes.finishedAt);
    const shiftStartTime = fte.currentShift.date.getTime();
    const shiftEndTime = shiftStartTime + 8 * 3600 * 1000;

    if (finishedAt >= shiftStartTime && finishedAt < shiftEndTime)
    {
      const data = {
        prodDowntimeId: changes._id
      };

      if (messengerClient)
      {
        messengerClient.request('downtimeFinished', data, _.noop);
      }
      else
      {
        app.broker.publish('prodDowntimeAlerts.downtimeFinished', data);
      }
    }
  }

  function onAlertChanged(message)
  {
    const data = {
      prodDowntimeAlertId: message.model._id
    };

    if (messengerClient)
    {
      messengerClient.request('alertChanged', data, _.noop);
    }
    else
    {
      app.broker.publish('prodDowntimeAlerts.alertChanged', data);
    }
  }
};
