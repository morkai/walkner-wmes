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

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    function()
    {
      var lockMasterEntries = lockEntries.bind(null, 'master');
      var lockLeaderEntries = lockEntries.bind(null, 'leader');

      app.broker.subscribe('shiftChanged', lockMasterEntries);
      app.broker.subscribe('shiftChanged', lockLeaderEntries);

      lockMasterEntries();
      lockLeaderEntries();
    }
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

  function lockEntries(type)
  {
    var FteEntryModel =
      app[module.config.mongooseId].model(type === 'master' ? 'FteMasterEntry': 'FteLeaderEntry');
    var currentShift = getCurrentShift();
    var condition = {
      locked: false,
      $or: [{date: {$ne: currentShift.date}}, {shift: {$ne: currentShift.no}}]
    };

    FteEntryModel.find(condition, function(err, fteEntries)
    {
      if (err)
      {
        return module.error("Failed to lock %s entries: %s", type, err.message);
      }

      if (!fteEntries.length)
      {
        return;
      }

      module.info("Locking %d %s entries...", fteEntries.length, type);

      fteEntries.forEach(function(fteEntry)
      {
        fteEntry.lock(null, function(err)
        {
          if (err)
          {
            module.error(
              "Failed to lock %s entry (%s): %s", type, fteEntry.get('_id'), err.message
            );
          }
        });
      });
    });
  }
};
