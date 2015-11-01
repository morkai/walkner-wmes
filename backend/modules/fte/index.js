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
    if (shiftChangeTimer !== null)
    {
      clearTimeout(shiftChangeTimer);
      shiftChangeTimer = null;
    }

    var actualCurrentShift = module.getCurrentShift();
    var currentShiftTime = module.currentShift.date.getTime();

    if (actualCurrentShift.date.getTime() > currentShiftTime)
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
    var date = new Date();
    var hours = date.getHours();
    var no = 3;

    if (hours >= 6 && hours < 14)
    {
      no = 1;
      date.setHours(6);
    }
    else if (hours >= 14 && hours < 22)
    {
      no = 2;
      date.setHours(14);
    }
    else
    {
      if (hours < 6)
      {
        date.setHours(6);

        date = new Date(date.getTime() - 8 * 3600 * 1000);
      }
    }

    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return {
      date: date,
      no: no
    };
  }

  function getNextShiftTime()
  {
    var shiftMoment = moment(module.currentShift.date.getTime());
    var currentShiftNo = module.currentShift.no;

    if (currentShiftNo === 1)
    {
      shiftMoment.hours(14);
    }
    else if (currentShiftNo === 2)
    {
      shiftMoment.hours(22);
    }
    else
    {
      shiftMoment.add(1, 'days').hours(6);
    }

    return shiftMoment.valueOf();
  }
};
