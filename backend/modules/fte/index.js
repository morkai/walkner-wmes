// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpCache = require('./cache');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

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
  module.getCurrentShift = getCurrentShift;

  module.currentShift = getCurrentShift();

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

  setUpShiftChangeBroadcast();

  function setUpShiftChangeBroadcast()
  {
    var actualCurrentShift = module.getCurrentShift();
    var currentShiftTime = module.currentShift.date.getTime();

    if (actualCurrentShift.date.getTime() > currentShiftTime)
    {
      return broadcastShiftChange();
    }

    var nextShiftTime = currentShiftTime + 8 * 3600 * 1000;
    var currentTime = Date.now();
    var timeDiff = nextShiftTime - currentTime;

    setTimeout(setUpShiftChangeBroadcast, timeDiff > 300000 ? 300000 : timeDiff);
  }

  function broadcastShiftChange()
  {
    module.currentShift = getCurrentShift();

    module.debug("Broadcasting a shift change (%d)...", module.currentShift.no);

    app.broker.publish('shiftChanged', module.currentShift);

    setUpShiftChangeBroadcast();
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
};
