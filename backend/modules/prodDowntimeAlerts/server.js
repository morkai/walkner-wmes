// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function setUpAlertsServer(app, module)
{
  var messengerServer = app[module.config.messengerServerId];
  var fte = app[module.config.fteId];
  var mongoose = app[module.config.mongooseId];
  var User = mongoose.model('User');
  var Aor = mongoose.model('Aor');
  var DowntimeReason = mongoose.model('DowntimeReason');
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var ProdDowntimeAlert = mongoose.model('ProdDowntimeAlert');

  var onLoad = [];
  var alertMap = {};
  var alertList = [];
  var downtimeMap = {};
  var aorNameMap = {};
  var reasonNameMap = {};

  app.broker.subscribe('app.started', onAppStarted).setLimit(1);

  if (messengerServer)
  {
    setUpRemoteServer();
  }
  else
  {
    setUpLocalServer();
  }

  function setUpRemoteServer()
  {
    messengerServer.handle('downtimeStarted', function(data, done)
    {
      onDowntimeStarted(data);
      done();
    });

    messengerServer.handle('downtimeFinished', function(data, done)
    {
      onDowntimeFinished(data);
      done();
    });

    messengerServer.handle('alertChanged', function(data, done)
    {
      onAlertChanged(data);
      done();
    });
  }

  function setUpLocalServer()
  {
    app.broker.subscribe('prodDowntimeAlerts.downtimeStarted', onDowntimeStarted);
    app.broker.subscribe('prodDowntimeAlerts.downtimeFinished', onDowntimeFinished);
    app.broker.subscribe('prodDowntimeAlerts.alertChanged', onAlertChanged);
  }

  function onAppStarted()
  {
    loadAlerts(function(err)
    {
      if (err)
      {
        return module.error("Failed to reload all alerts: %s", err.message);
      }

      loadActiveDowntimes(function(err)
      {
        if (err)
        {
          return module.error("Failed to load all downtimes: %s", err.message);
        }

        _.forEach(onLoad, function(cb) { cb(); });

        onLoad = null;
      });
    });
  }

  function onDowntimeStarted(data)
  {
    if (onLoad)
    {
      onLoad.push(handleDowntimeStart.bind(null, data.prodDowntimeId));
    }
    else
    {
      handleDowntimeStart(data.prodDowntimeId);
    }
  }

  function onDowntimeFinished(data)
  {
    if (onLoad)
    {
      onLoad.push(handleDowntimeFinish.bind(null, data.prodDowntimeId));
    }
    else
    {
      handleDowntimeFinish(data.prodDowntimeId);
    }
  }

  function onAlertChanged(data)
  {
    reloadAlert(data.prodDowntimeAlertId);
  }

  function loadAlerts(done)
  {
    ProdDowntimeAlert.find().lean().exec(function(err, prodDowntimeAlerts)
    {
      if (err)
      {
        return done(err);
      }

      alertMap = {};
      alertList = [];

      _.forEach(prodDowntimeAlerts, mapAlert);

      return done();
    });
  }

  function reloadAlert(prodDowntimeAlertId)
  {
    ProdDowntimeAlert.findById(prodDowntimeAlertId).lean().exec(function(err, prodDowntimeAlert)
    {
      if (err)
      {
        return module.error("Failed to reload alert [%s]: %s", prodDowntimeAlertId, err.message);
      }

      if (prodDowntimeAlert)
      {
        mapAlert(prodDowntimeAlert);
      }
      else
      {
        delete alertMap[prodDowntimeAlertId];

        alertList = _.filter(alertList, function(alert) { return alert._id !== prodDowntimeAlertId; });
      }
    });
  }

  function mapAlert(alert)
  {
    alert._id = alert._id.toString();

    alertMap[alert._id] = alert;

    var index = _.findIndex(alertList, '_id', alert._id);

    if (index !== -1)
    {
      alertList[index] = alert;
    }
    else
    {
      alertList.push(alert);
    }
  }

  function loadActiveDowntimes(done)
  {
    ProdDowntime.find({finishedAt: null}).lean().exec(function(err, prodDowntimes)
    {
      if (err)
      {
        return done(err);
      }

      var currentShiftTime = fte.currentShift.date.getTime();

      _.forEach(prodDowntimes, function(prodDowntime)
      {
        if (prodDowntime.date.getTime() !== currentShiftTime)
        {
          return;
        }

        var downtime = createDowntime(prodDowntime);

        if (_.isEmpty(downtime.alerts))
        {
          mapMatchingAlerts(downtime);

          if (_.isEmpty(downtime.alerts))
          {
            return;
          }
        }

        downtimeMap[downtime._id] = downtime;

        handleDowntimeAlerts(downtime._id);
      });

      return done();
    });
  }

  function handleDowntimeStart(prodDowntimeId)
  {
    step(
      function findProdDowntimeStep()
      {
        ProdDowntime.findById(prodDowntimeId).lean().exec(this.next());
      },
      function findMatchingAlertsStep(err, prodDowntime)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodDowntime || prodDowntime.finishedAt)
        {
          return this.skip();
        }

        var downtime = mapMatchingAlerts(createDowntime(prodDowntime));

        if (!_.isEmpty(downtime.alerts))
        {
          downtimeMap[prodDowntime._id] = downtime;
        }
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("Failed to handle downtime start [%s]: %s", prodDowntimeId, err.message);
        }
        else
        {
          handleDowntimeAlerts(prodDowntimeId);
        }
      }
    );
  }

  function handleDowntimeFinish(prodDowntimeId)
  {
    var downtime = downtimeMap[prodDowntimeId];

    if (downtime)
    {
      downtime.finished = true;

      handleDowntimeAlerts(prodDowntimeId);
    }
  }

  function handleDowntimeAlerts(prodDowntimeId)
  {
    var downtime = downtimeMap[prodDowntimeId];

    if (!downtime)
    {
      return;
    }

    downtime.duration = Math.max(0, (Date.now() - downtime.startedAt) / 1000);

    var anyActiveAlerts = false;

    _.forEach(downtime.alerts, function(alert)
    {
      if (alert.timer)
      {
        clearTimeout(alert.timer);
        alert.timer = null;
      }

      handleDowntimeAlert(downtime, alert);

      if (alert.active)
      {
        anyActiveAlerts = true;
      }
    });

    if (!anyActiveAlerts)
    {
      delete downtimeMap[prodDowntimeId];
    }
  }

  function handleDowntimeAlert(downtime, alert)
  {
    if (!alert.active)
    {
      return;
    }

    if (downtime.finished)
    {
      return finishDowntimeAlert(downtime, alert);
    }

    var currentActionIndexes = findCurrentActionIndexes(alert.actions, downtime.duration);
    var timeToNextAction;

    if (currentActionIndexes.length === 0)
    {
      timeToNextAction = calcTimeToAction(downtime, alert, 0);
    }
    else
    {
      var currentActionIndex = _.last(currentActionIndexes);
      var nextActionIndex = currentActionIndex + 1;
      var isLastAction = nextActionIndex === alert.actions.length;

      if (alert.action < currentActionIndex || (isLastAction && alert.repeatInterval))
      {
        executeActions(downtime, alert, currentActionIndexes);
      }

      alert.action = currentActionIndex;

      if (isLastAction && !alert.repeatInterval)
      {
        return;
      }

      timeToNextAction = calcTimeToAction(downtime, alert, nextActionIndex);
    }

    if (timeToNextAction >= 0)
    {
      alert.timer = setTimeout(handleDowntimeAlerts, timeToNextAction, downtime._id);
    }
  }

  function calcTimeToAction(downtime, alert, actionIndex)
  {
    if (actionIndex === alert.actions.length)
    {
      return calcTimeToLastActionRepeat(downtime.startedAt, _.last(alert.actions).delay, alert.repeatInterval * 1000);
    }

    var action = alert.actions[actionIndex];
    var actionStartTime = downtime.startedAt + action.delay * 1000;

    return actionStartTime - Date.now();
  }

  function calcTimeToLastActionRepeat(startedAt, lastActionDelay, repeatInterval)
  {
    if (!repeatInterval)
    {
      return -1;
    }

    var lastActionTime = startedAt + lastActionDelay * 1000;

    return repeatInterval - ((Date.now() - lastActionTime) % repeatInterval);
  }

  function finishDowntimeAlert(downtime, alert)
  {
    alert.active = false;

    if (alert.action === -1)
    {
      return;
    }

    var data = {
      downtimeId: downtime._id,
      alertId: alert._id,
      alertName: alert.name
    };

    createProdLogEntry('finishDowntimeAlert', downtime, data).save(function(err)
    {
      if (err)
      {
        module.error("Failed to save the [finishDowntimeAlert] operation: %s", err.message);
      }
      else
      {
        app.broker.publish('production.logEntries.saved');
      }
    });
  }

  function findCurrentActionIndexes(actions, duration)
  {
    var currentActionIndexes = [];
    var matchedDelay = -1;

    for (var i = 0; i < actions.length; ++i)
    {
      var delay = actions[i].delay;

      if (duration >= delay)
      {
        matchedDelay = delay;
      }
    }

    if (matchedDelay !== -1)
    {
      for (var actionIndex = 0; actionIndex < actions.length; ++actionIndex)
      {
        if (actions[actionIndex].delay === matchedDelay)
        {
          currentActionIndexes.push(actionIndex);
        }
      }
    }

    return currentActionIndexes;
  }

  function executeActions(downtime, alert, actionIndexes)
  {
    _.forEach(actionIndexes, function(actionIndex)
    {
      executeAction(downtime, alert, actionIndex);
    });
  }

  function executeAction(downtime, alert, actionIndex)
  {
    var action = alert.actions[actionIndex];
    var logData = {
      downtimeId: downtime._id,
      alertId: alert._id,
      alertName: alert.name,
      action: actionIndex,
      recipients: []
    };

    step(
      function()
      {
        findRecipientUsers(downtime, alert, action, this.parallel());
        findMessageValues(downtime, this.parallel());
      },
      function(err, users, messageValues)
      {
        if (err)
        {
          return this.skip(err);
        }

        var currentDate = new Date();
        var currentTimeValue = currentDate.getHours() * 1000 + currentDate.getMinutes();
        var emailRecipients = action.sendEmail && app[module.config.mailSenderId]
          ? _.filter(users, filterEmailRecipient)
          : [];
        var smsRecipients = action.sendSms && app[module.config.smsSenderId]
          ? _.filter(users, filterSmsRecipient.bind(null, currentTimeValue))
          : [];
        var recipients = {};
        var addRecipient = function(user) { recipients[user._id] = user.label; };

        _.forEach(emailRecipients, addRecipient);
        _.forEach(smsRecipients, addRecipient);

        logData.recipients = _.values(recipients);

        if (emailRecipients.length)
        {
          sendEmail(emailRecipients, messageValues);
        }

        if (smsRecipients.length)
        {
          sendSms(smsRecipients, messageValues);
        }

        setImmediate(this.next());
      },
      function()
      {
        createProdLogEntry('notifyDowntimeAlert', downtime, logData).save(this.next());
      },
      function(err)
      {
        if (err)
        {
          module.error(
            "Failed to execute action [%d] (alert=[%s] downtime=[%s]): %s",
            actionIndex,
            alert._id,
            downtime._id,
            err.message
          );
        }
        else
        {
          app.broker.publish('production.logEntries.saved');
        }
      }
    );
  }

  function createDowntime(prodDowntime)
  {
    var startedAt = prodDowntime.startedAt.getTime();
    var alerts = _.map(prodDowntime.alerts, function(alert)
    {
      return alertMap[alert._id] ? null : _.extend(alert, alertMap[alert._id], {
        timer: null
      });
    });

    return {
      _id: prodDowntime._id,
      rid: prodDowntime.rid,
      reason: prodDowntime.reason,
      aor: prodDowntime.aor.toString(),
      division: prodDowntime.division,
      subdivision: prodDowntime.subdivision.toString(),
      mrpControllers: prodDowntime.mrpControllers,
      prodFlow: prodDowntime.prodFlow.toString(),
      workCenter: prodDowntime.workCenter,
      prodLine: prodDowntime.prodLine,
      startedAt: startedAt,
      master: prodDowntime.master ? prodDowntime.master.id : null,
      leader: prodDowntime.leader ? prodDowntime.leader.id : null,
      prodShift: prodDowntime.prodShift,
      prodShiftOrder: prodDowntime.prodShiftOrder,
      duration: Math.max(0, (Date.now() - startedAt) / 1000),
      finished: !!prodDowntime.finishedAt,
      alerts: _.filter(alerts, function(alert) { return !!alert; })
    };
  }

  function createProdLogEntry(type, downtime, data)
  {
    var createdAt = new Date();

    return new ProdLogEntry({
      _id: ProdLogEntry.generateId(createdAt, downtime.prodLine),
      type: type,
      division: downtime.division,
      subdivision: new ObjectId(downtime.subdivision),
      mrpControllers: downtime.mrpControllers,
      prodFlow: new ObjectId(downtime.prodFlow),
      workCenter: downtime.workCenter,
      prodLine: downtime.prodLine,
      prodShift: downtime.prodShift,
      prodShiftOrder: downtime.prodShiftOrder,
      creator: {
        id: null,
        ip: '127.0.0.1',
        cname: 'LOCALHOST',
        label: 'System'
      },
      createdAt: createdAt,
      savedAt: createdAt,
      todo: true,
      data: data
    });
  }

  function mapMatchingAlerts(downtime)
  {
    downtime.alerts = _.map(findMatchingAlerts(downtime), function(alert)
    {
      return _.extend({}, alert, {
        action: -1,
        active: true,
        timer: null
      });
    });

    return downtime;
  }

  function findMatchingAlerts(downtime)
  {
    return _.filter(alertList, function(alert)
    {
      return matchAlert(downtime, alert.conditions);
    });
  }

  function matchAlert(downtime, conditions)
  {
    return _.all(conditions, function(condition)
    {
      return matchAlertCondition(downtime, condition);
    });
  }

  function matchAlertCondition(downtime, condition)
  {
    var property = condition.type;
    var actualValues = _.isArray(downtime[property]) ? downtime[property] : [downtime[property]];
    var requiredValues = condition.values;
    var match = _.some(actualValues, function(actualValue) { return _.includes(requiredValues, actualValue); });

    if (condition.mode === 'include')
    {
      return match;
    }

    if (condition.mode === 'exclude')
    {
      return !match;
    }

    return false;
  }

  function findRecipientUsers(downtime, alert, action, done)
  {
    var userIds = {};

    _.forEach(alert.userWhitelist, function(user) { userIds[user.id] = true; });
    _.forEach(action.userWhitelist, function(user) { userIds[user.id] = true; });

    if (action.informMaster && downtime.master)
    {
      userIds[downtime.master] = true;
    }

    if (action.informLeader && downtime.leader)
    {
      userIds[downtime.leader] = true;
    }

    step(
      function()
      {
        var fields = {
          firstName: 1,
          lastName: 1,
          login: 1,
          email: 1,
          mobile: 1
        };

        userIds = Object.keys(userIds)
          .filter(function(userId) { return /^[a-f0-9]{24}$/.test(userId); })
          .map(function(userId) { return new ObjectId(userId); });

        if (userIds.length)
        {
          User
            .find({_id: {$in: userIds}}, fields)
            .lean()
            .exec(this.parallel());
        }
        else
        {
          setImmediate(this.parallel(), null, []);
        }

        if (action.informAor)
        {
          User
            .find({aors: new ObjectId(downtime.aor)}, fields)
            .lean()
            .exec(this.parallel());
        }
        else
        {
          setImmediate(this.parallel(), null, []);
        }

        if (action.informManager)
        {
          User
            .find({prodFunction: 'manager', orgUnitId: downtime.division}, fields)
            .lean()
            .exec(this.parallel());
        }
        else
        {
          setImmediate(this.parallel(), null, []);
        }
      },
      function(err, idUsers, aorUsers, managerUsers)
      {
        if (err)
        {
          return done(err);
        }

        var blacklist = {};

        _.forEach(alert.userBlacklist, function(user) { blacklist[user.id] = true; });
        _.forEach(action.userBlacklist, function(user) { blacklist[user.id] = true; });

        var users = {};
        var mapUser = function(user)
        {
          user._id = user._id.toString();

          if (!blacklist[user._id])
          {
            if (_.isEmpty(user.lastName) && _.isEmpty(user.firstName))
            {
              user.label = user.login;
            }
            else
            {
              user.label = user.lastName + ' ' + user.firstName;
            }

            users[user._id] = user;
          }
        };

        _.forEach(idUsers, mapUser);
        _.forEach(aorUsers, mapUser);
        _.forEach(managerUsers, mapUser);

        return done(null, _.values(users));
      }
    );
  }

  function filterEmailRecipient(user)
  {
    return _.includes(user.email, '@');
  }

  function filterSmsRecipient(currentTimeValue, user)
  {
    return _.some(user.mobile, function(mobile)
    {
      var match = true;
      var fromTime = parseMobileTime(mobile.fromTime);
      var toTime = parseMobileTime(mobile.toTime === '00:00' ? '24:00' : mobile.toTime);

      if (toTime.value < fromTime.value)
      {
        match = currentTimeValue < toTime.value || currentTimeValue >= fromTime.value;
      }
      else if (fromTime.value < toTime.value)
      {
        match = currentTimeValue >= fromTime.value && currentTimeValue < toTime.value;
      }

      if (match)
      {
        user.mobile = mobile.number;
      }

      return match;
    });
  }

  function parseMobileTime(time)
  {
    var parts = time.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);

    return {
      hours: hours,
      minutes: minutes,
      value: hours * 1000 + minutes
    };
  }

  function findMessageValues(downtime, done)
  {
    var messageValues = {
      _id: downtime._id,
      rid: downtime.rid,
      reason: null,
      aor: null,
      division: downtime.division,
      prodLine: downtime.prodLine,
      duration: Math.min(1, Math.round(downtime.duration / 60))
    };

    step(
      function()
      {
        findReasonName(downtime.reason, this.parallel());
        findAorName(downtime.aor, this.parallel());
      },
      function(err, reasonName, aorName)
      {
        if (err)
        {
          return done(err);
        }

        messageValues.reason = reasonName;
        messageValues.aor = aorName;

        return done(null, messageValues);
      }
    );
  }

  function findReasonName(reasonId, done)
  {
    if (reasonNameMap[reasonId])
    {
      return setImmediate(done, null, reasonNameMap[reasonId]);
    }

    DowntimeReason.findById(reasonId, {label: 1}).lean().exec(function(err, reason)
    {
      if (err)
      {
        return done(err);
      }

      if (reason)
      {
        reasonNameMap[reasonId] = reason.label;
      }

      return done(null, reasonNameMap[reasonId] || reasonId);
    });
  }

  function findAorName(aorId, done)
  {
    if (aorNameMap[aorId])
    {
      return setImmediate(done, null, aorNameMap[aorId]);
    }

    Aor.findById(aorId, {name: 1}).lean().exec(function(err, aor)
    {
      if (err)
      {
        return done(err);
      }

      if (aor)
      {
        aorNameMap[aorId] = aor.name;
      }

      return done(null, aorNameMap[aorId] || '?');
    });
  }

  function sendEmail(recipients, messageValues)
  {
    var emails = _.pluck(recipients, 'email');
    var subject = '[WMES] Przestój ' + messageValues.rid + ': ' + messageValues.reason;
    var urlPrefix = module.config.emailUrlPrefix;
    var text = [
      'Przestój: ' + messageValues.rid,
      'Czas trwania: ' + messageValues.duration + ' min.',
      'Powód: ' + messageValues.reason,
      'Obszar: ' + messageValues.aor,
      'Linia: ' + messageValues.division + ' \\ ' + messageValues.prodLine,
      '',
      'Alarm: ' + urlPrefix + 'r/downtime/' + messageValues.rid,
      'Wszystkie alarmy: ' + urlPrefix + 'r/downtimes/alerts',
      'Wszystkie przestoje: ' + urlPrefix + 'r/downtimes/all',
      '',
      'Ta wiadomość została wygenerowana automatycznie przez system WMES.'
    ];
    var mailOptions = {
      to: emails,
      replyTo: emails,
      subject: subject,
      text: text.join('\t\r\n')
    };

    app[module.config.mailSenderId].send(mailOptions, function(err)
    {
      if (err)
      {
        module.error("Failed to send e-mail notification: %s", err.message);
      }
    });
  }

  function sendSms(recipients, messageValues)
  {
    var smsOptions = {
      to: _.pluck(recipients, 'mobile'),
      text: 'Przestój ' + messageValues.rid
        + ' |' + messageValues.duration + ' min.'
        + ' |' + messageValues.division
        + ' |' + messageValues.prodLine
        + ' |' + messageValues.aor
        + ' |' + messageValues.reason
    };

    app[module.config.smsSenderId].send(smsOptions, function(err)
    {
      if (err)
      {
        module.error("Failed to send SMS notification: %s", err.message);
      }
    });
  }
};
