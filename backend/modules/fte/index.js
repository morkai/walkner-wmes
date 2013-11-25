'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio'
};

exports.start = function startFteModule(app, module)
{
  module.getCurrentShift = getCurrentShift;

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.sioId
    ],
    setUpCommands.bind(null, app, module)
  );

  setUpShiftChangeBroadcast();

  function setUpShiftChangeBroadcast()
  {
    var h6 = 6 * 3600 * 1000;
    var h8 = 8 * 3600 * 1000;
    var currentShift = getCurrentShift();
    var currentShiftTime = currentShift.date.getTime() + h6 + (currentShift.shift - 1) * h8;
    var nextShiftTime = currentShiftTime + h8;

    setTimeout(broadcastShiftChange, nextShiftTime - Date.now());
  }

  function broadcastShiftChange()
  {
    var newShift = getCurrentShift();

    module.debug("Broadcasting a shift change (%d)...", newShift.shift);

    app.broker.publish('shiftChanged', newShift);

    setUpShiftChangeBroadcast();
  }

  function getCurrentShift()
  {
    var date = new Date();
    var hours = date.getHours();
    var shift = 3;

    if (hours >= 6 && hours < 14)
    {
      shift = 1;
    }
    else if (hours >= 14 && hours < 22)
    {
      shift = 2;
    }
    else if (hours < 6)
    {
      date = new Date(date.getTime() - 24 * 3600 * 1000);
    }

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return {
      date: date,
      shift: shift
    };
  }

  function getNextShift()
  {
    var currentShift = getCurrentShift();

    if (currentShift.shift === 3)
    {
      return {
        date: new Date(currentShift.date.getTime() + 24 * 3600 * 1000),
        shift: 1
      };
    }

    return {
      date: currentShift.date,
      shift: currentShift.shift + 1
    };
  }
};
