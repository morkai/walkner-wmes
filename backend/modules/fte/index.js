'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  subdivisionsId: 'subdivisions'
};

exports.start = function startFteModule(app, module)
{
  // TODO: Lock entries on shift change

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
      module.config.subdivisionsId
    ],
    setUpCommands.bind(null, app, module)
  );

  setUpShiftChangeBroadcast();

  function setUpShiftChangeBroadcast()
  {
    var h6 = 6 * 3600 * 1000;
    var h8 = 8 * 3600 * 1000;
    var currentShift = getCurrentShift();
    var currentShiftTime = currentShift.date.getTime() + h6 + (currentShift.no - 1) * h8;
    var nextShiftTime = currentShiftTime + h8;

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
    }
    else if (hours >= 14 && hours < 22)
    {
      no = 2;
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
      no: no
    };
  }
};
