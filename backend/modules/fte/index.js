// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var moment = require('moment');
var setUpCache = require('./cache');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var editFteMasterEntry = require('./editFteMasterEntry');
var editFteLeaderEntry = require('./editFteLeaderEntry');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  divisionsId: 'divisions',
  subdivisionsId: 'subdivisions',
  settingsId: 'settings'
};

exports.start = function startFteModule(app, module)
{
  var shiftChangeTimer = null;

  module.getCurrentShift = getCurrentShift;

  module.currentShift = getCurrentShift();

  module.editFteMasterEntry = editFteMasterEntry.bind(null, app, module);
  module.editFteLeaderEntry = editFteLeaderEntry.bind(null, app, module);

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpCache.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.subdivisionsId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.sioId,
      module.config.divisionsId,
      module.config.subdivisionsId,
      module.config.settingsId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.broker.subscribe('app.started', checkShiftChange);

  function checkShiftChange()
  {
    if (shiftChangeTimer)
    {
      clearTimeout(shiftChangeTimer);
      shiftChangeTimer = null;
    }

    var realCurrentShift = getCurrentShift();

    if (realCurrentShift.date > module.currentShift.date)
    {
      return changeShift();
    }

    var nextShiftTime = getNextShiftTime();
    var currentTime = Date.now();
    var timeDiff = nextShiftTime - currentTime;
    var delay = timeDiff > 300000 ? 300000 : timeDiff;

    shiftChangeTimer = setTimeout(checkShiftChange, delay);
  }

  function changeShift()
  {
    module.currentShift = getCurrentShift();

    module.debug("Changed to shift %d...", module.currentShift.no);

    app.broker.publish('shiftChanged', module.currentShift);

    checkShiftChange();
  }

  function getCurrentShift()
  {
    var date = moment().startOf('hour');
    var hours = date.hours();
    var no = 3;

    if (hours >= 6 && hours < 14)
    {
      no = 1;
      date.hours(6);
    }
    else if (hours >= 14 && hours < 22)
    {
      no = 2;
      date.hours(14);
    }
    else
    {
      if (hours < 6)
      {
        date.subtract(1, 'days');
      }

      date.hours(22);
    }

    return {
      date: date.toDate(),
      no: no
    };
  }

  function getNextShiftTime()
  {
    var nextShiftMoment = moment(module.currentShift.date.getTime());
    var currentShiftNo = module.currentShift.no;

    if (currentShiftNo === 1)
    {
      nextShiftMoment.hours(14);
    }
    else if (currentShiftNo === 2)
    {
      nextShiftMoment.hours(22);
    }
    else
    {
      nextShiftMoment.add(1, 'days').hours(6);
    }

    return nextShiftMoment.valueOf();
  }
};
