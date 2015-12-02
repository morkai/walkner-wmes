// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function setUpAlertsClient(app, module)
{
  var fte = app[module.config.fteId];
  var messengerClient = app[module.config.messengerClientId];

  app.broker.subscribe('prodDowntimes.created.**', onDowntimeCreated);
  app.broker.subscribe('prodDowntimes.finished.**', onDowntimeFinished);
  app.broker.subscribe('prodDowntimeAlerts.added', onAlertChanged);
  app.broker.subscribe('prodDowntimeAlerts.edited', onAlertChanged);
  app.broker.subscribe('prodDowntimeAlerts.deleted', onAlertChanged);

  function onDowntimeCreated(prodDowntime)
  {
    if (_.isDate(prodDowntime.date) && prodDowntime.date.getTime() === fte.currentShift.date.getTime())
    {
      var data = {
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
    var finishedAt = Date.parse(changes.finishedAt);
    var shiftStartTime = fte.currentShift.date.getTime();
    var shiftEndTime = shiftStartTime + 8 * 3600 * 1000;

    if (finishedAt >= shiftStartTime && finishedAt < shiftEndTime)
    {
      var data = {
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
    var data = {
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
