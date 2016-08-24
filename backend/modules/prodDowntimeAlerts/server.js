// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');
var ejs = require('ejs');
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function setUpAlertsServer(app, module)
{
  var messengerServer = app[module.config.messengerServerId];
  var fte = app[module.config.fteId];
  var mongoose = app[module.config.mongooseId];
  var User = mongoose.model('User');
  var Aor = mongoose.model('Aor');
  var DowntimeReason = mongoose.model('DowntimeReason');
  var ProdFlow = mongoose.model('ProdFlow');
  var WorkCenter = mongoose.model('WorkCenter');
  var ProdLine = mongoose.model('ProdLine');
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var ProdDowntimeAlert = mongoose.model('ProdDowntimeAlert');

  var emailTemplateFile = __dirname + '/email.pl.ejs';
  var renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });
  var onLoad = [];
  var alertMap = {};
  var alertList = [];
  var downtimeMap = {};
  var nameMaps = {
    aor: {},
    reason: {},
    prodFlow: {},
    workCenter: {},
    prodLine: {}
  };

  app.broker.subscribe('app.started', onAppStarted).setLimit(1);
  app.broker.subscribe('shiftChanged', onShiftChanged);

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

  function onShiftChanged()
  {
    setTimeout(finishOldAlerts, 10000);
  }

  function finishOldAlerts()
  {
    var currentShiftTime = fte.currentShift.date.getTime();

    _.forEach(downtimeMap, function(downtime)
    {
      if (downtime.shiftTime !== currentShiftTime)
      {
        handleDowntimeFinish(downtime._id);
      }
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
    step(
      function findProdDowntimesStep()
      {
        var conditions = {
          date: fte.currentShift.date,
          finishedAt: null
        };

        ProdDowntime.find(conditions, {changes: 0}).lean().exec(this.next());
      },
      function createDowntimesStep(err, prodDowntimes)
      {
        if (err)
        {
          return this.skip(err);
        }

        var prodShiftOrdersToFind = {};

        _.forEach(prodDowntimes, function(prodDowntime)
        {
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

          if (downtime.prodShiftOrder)
          {
            if (!prodShiftOrdersToFind[downtime.prodShiftOrder])
            {
              prodShiftOrdersToFind[downtime.prodShiftOrder] = [];
            }

            prodShiftOrdersToFind[downtime.prodShiftOrder].push(downtime);
          }
        });

        this.prodShiftOrdersToFind = prodShiftOrdersToFind;

        setImmediate(this.next());
      },
      function findProdShiftOrdersStep()
      {
        var conditions = {
          _id: {$in: Object.keys(this.prodShiftOrdersToFind)}
        };
        var fields = {
          _id: 1,
          prodShift: 1,
          date: 1,
          startedAt: 1,
          'orderData.no': 1,
          'orderData.name': 1,
          'orderData.description': 1,
          'orderData.nc12': 1
        };

        ProdShiftOrder.find(conditions, fields).lean().exec(this.next());
      },
      function mapOrderToDowntimesStep(err, prodShiftOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        var prodShiftOrdersToFind = this.prodShiftOrdersToFind;

        _.forEach(prodShiftOrders, function(prodShiftOrder)
        {
          mapOrderToDowntimes(prodShiftOrder, prodShiftOrdersToFind[prodShiftOrder._id]);
        });
      },
      function handleAlertsStep()
      {
        _.forEach(downtimeMap, function(downtime)
        {
          handleDowntimeAlerts(downtime._id);
        });
      },
      function finalizeStep(err)
      {
        this.prodShiftOrdersToFind = null;

        setImmediate(done, err);
      }
    );
  }

  function mapOrderToDowntimes(prodShiftOrder, downtimes)
  {
    var orderData = prodShiftOrder.orderData || {};
    var order = {
      prodShiftOrder: prodShiftOrder._id,
      prodShift: prodShiftOrder.prodShift,
      date: prodShiftOrder.date,
      startedAt: prodShiftOrder.startedAt.getTime(),
      no: orderData.no || '?',
      name: orderData.description || orderData.name || '?',
      nc12: orderData.nc12 || '?'
    };

    _.forEach(downtimes, function(downtime)
    {
      downtime.order = order;
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
      function findProdShiftOrderStep()
      {
        var downtime = downtimeMap[prodDowntimeId];

        if (!downtime || !downtime.prodShiftOrder)
        {
          return this.skip();
        }

        var fields = {
          _id: 1,
          prodShift: 1,
          date: 1,
          startedAt: 1,
          'orderData.no': 1,
          'orderData.name': 1,
          'orderData.description': 1,
          'orderData.nc12': 1
        };

        ProdShiftOrder.findById(downtime.prodShiftOrder, fields).lean().exec(this.next());
      },
      function mapOrderToDowntimeStep(err, prodShiftOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        var downtime = downtimeMap[prodDowntimeId];

        if (downtime && prodShiftOrder)
        {
          mapOrderToDowntimes(prodShiftOrder, [downtime]);
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
        prepareMessageValues(downtime, this.parallel());
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
      return alertMap[alert._id] ? null : _.assign(alert, alertMap[alert._id], {
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
      shiftTime: prodDowntime.date.getTime(),
      startedAt: startedAt,
      master: prodDowntime.master,
      leader: prodDowntime.leader,
      operator: prodDowntime.operator,
      prodShift: prodDowntime.prodShift,
      prodShiftOrder: prodDowntime.prodShiftOrder,
      order: null,
      comment: prodDowntime.reasonComment,
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
      return _.assign({}, alert, {
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
    return _.every(conditions, function(condition)
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
      userIds[downtime.master.id] = true;
    }

    if (action.informLeader && downtime.leader)
    {
      userIds[downtime.leader.id] = true;
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

  function prepareMessageValues(downtime, done)
  {
    var now = Date.now();
    var messageValues = {
      urlPrefix: module.config.emailUrlPrefix,
      downtime: {
        prodDowntime: downtime._id,
        rid: downtime.rid,
        reason: downtime.reason,
        aor: downtime.aor,
        startedAt: moment(downtime.startedAt).format('HH:mm:ss'),
        duration: formatDuration(downtime.startedAt, now),
        master: downtime.master ? downtime.master.label : null,
        leader: downtime.leader ? downtime.leader.label : null,
        operator: downtime.operator ? downtime.operator.label : null,
        comment: downtime.comment
      },
      order: !downtime.order ? null : {
        prodShiftOrder: downtime.order.prodShiftOrder,
        prodShift: downtime.order.prodShift,
        no: downtime.order.no,
        name: downtime.order.name,
        nc12: downtime.order.nc12,
        shift: moment(downtime.order.date).format('YYYY-MM-DD') + ', ' + formatShiftNo(downtime.order.date),
        startedAt: moment(downtime.order.startedAt).format('HH:mm:ss'),
        duration: formatDuration(downtime.order.startedAt, now)
      },
      orgUnits: {
        division: downtime.division,
        mrp: downtime.mrpControllers.join(', '),
        prodFlow: downtime.prodFlow,
        workCenter: downtime.workCenter,
        prodLineId: downtime.prodLine,
        prodLine: downtime.prodLine
      }
    };

    step(
      function()
      {
        findName(DowntimeReason, downtime, 'reason', 'label', this.parallel());
        findName(Aor, downtime, 'aor', 'name', this.parallel());
        findName(ProdFlow, downtime, 'prodFlow', 'name', this.parallel());
        findName(WorkCenter, downtime, 'workCenter', 'description', this.parallel());
        findName(ProdLine, downtime, 'prodLine', 'description', this.parallel());
      },
      function(err, reasonName, aorName, prodFlowName, workCenterName, prodLineName)
      {
        if (err)
        {
          return done(err);
        }

        messageValues.downtime.reason = formatNameAndId(reasonName, downtime.reason);
        messageValues.downtime.aor = aorName;
        messageValues.orgUnits.prodFlow = prodFlowName;
        messageValues.orgUnits.workCenter = formatNameAndId(workCenterName, downtime.workCenter);
        messageValues.orgUnits.prodLine = formatNameAndId(prodLineName, downtime.prodLine);

        return done(null, messageValues);
      }
    );
  }

  function formatNameAndId(name, id)
  {
    if (name === id)
    {
      return name;
    }

    return name + ' (' + id + ')';
  }

  function findName(Model, downtime, mapProperty, nameProperty, done)
  {
    var id = downtime[mapProperty];
    var nameMap = nameMaps[mapProperty];

    if (nameMap[id])
    {
      return setImmediate(done, null, nameMap[id]);
    }

    var fields = {};
    fields[nameProperty] = 1;

    Model.findById(id, fields).lean().exec(function(err, model)
    {
      if (err)
      {
        return done(err);
      }

      if (model)
      {
        nameMap[id] = model[nameProperty];
      }

      return done(null, nameMap[id] || id);
    });
  }

  function sendEmail(recipients, messageValues)
  {
    var emails = _.map(recipients, 'email');
    var subject = `[WMES] Przestój ${messageValues.downtime.rid}: `
      + `${messageValues.downtime.reason} `
      + `(${messageValues.order.name})`;
    var mailOptions = {
      to: emails,
      replyTo: emails,
      subject: subject,
      html: renderEmail(messageValues)
    };

    app[module.config.mailSenderId].send(mailOptions, function(err)
    {
      if (err)
      {
        module.error("Failed to send e-mail notification: %s", err.message);
      }
      else
      {
        module.debug(`Sent e-mail about [${messageValues.downtime.rid}] to: ${emails}`);
      }
    });
  }

  function sendSms(recipients, messageValues)
  {
    var smsOptions = {
      to: _.map(recipients, 'mobile'),
      text: 'Przestój ' + messageValues.downtime.rid
        + ' |' + messageValues.downtime.duration
        + ' |' + messageValues.orgUnits.division
        + ' |' + messageValues.orgUnits.prodLineId
        + ' |' + messageValues.downtime.aor
        + ' |' + messageValues.downtime.reason
    };

    app[module.config.smsSenderId].send(smsOptions, function(err)
    {
      if (err)
      {
        module.error("Failed to send SMS notification: %s", err.message);
      }
      else
      {
        module.debug(`Sent SMS about [${messageValues.downtime.rid}] to: ${smsOptions.to}`);
      }
    });
  }

  function formatShiftNo(date)
  {
    var hours = date.getHours();

    return hours === 6 ? 'I' : hours === 14 ? 'II' : 'III';
  }

  function formatDuration(fromTime, toTime)
  {
    var compact = true;
    var ms = false;
    var time = (toTime - fromTime) / 1000;

    var str = '';
    var hours = Math.floor(time / 3600);

    if (hours > 0)
    {
      str += compact ? (rpad0(hours, 2) + ':') : (' ' + hours + 'h');
      time = time % 3600;
    }
    else if (compact)
    {
      str += '00:';
    }

    var minutes = Math.floor(time / 60);

    if (minutes > 0)
    {
      str += compact ? (rpad0(minutes, 2) + ':') : (' ' + minutes + 'min');
      time = time % 60;
    }
    else if (compact)
    {
      str += '00:';
    }

    var seconds = time;

    if (seconds >= 1)
    {
      str += compact
        ? rpad0(Math[ms ? 'floor' : 'round'](seconds), 2)
        : (' ' + Math[ms ? 'floor' : 'round'](seconds) + 's');

      if (ms && seconds % 1 !== 0)
      {
        str += compact
          ? ('.' + rpad0(Math.round(seconds % 1 * 1000), 3))
          : (' ' + (Math.round(seconds % 1 * 1000) + 'ms'));
      }
    }
    else if (seconds > 0 && str === '')
    {
      str += ' ' + (seconds * 1000) + 'ms';
    }
    else if (compact)
    {
      str += '00';
    }

    return compact ? str : str.substr(1);
  }

  function rpad0(val, length)
  {
    val = String(val);

    while (val.length < length)
    {
      val = '0' + val;
    }

    return val;
  }
};
