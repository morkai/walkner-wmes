'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  divisionsId: 'divisions',
  subdivisionsId: 'subdivisions'
};

exports.start = function startFteModule(app, module)
{
  module.getCurrentShift = getCurrentShift;

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.subdivisionsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.sioId,
      module.config.divisionsId,
      module.config.subdivisionsId
    ],
    setUpCommands.bind(null, app, module)
  );

  setUpShiftChangeBroadcast();

  function setUpShiftChangeBroadcast()
  {
    // TODO: Handle DST changes
    var currentShift = getCurrentShift();
    var nextShiftTime = currentShift.date.getTime() + 8 * 3600 * 1000;

    setTimeout(broadcastShiftChange, nextShiftTime - Date.now());
  }

  function broadcastShiftChange()
  {
    var newShift = getCurrentShift();

    module.debug("Broadcasting a shift change (%d)...", newShift.no);

    app.broker.publish('shiftChanged', newShift);

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
