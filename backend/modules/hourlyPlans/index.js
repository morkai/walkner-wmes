'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  divisionsId: 'divisions',
  fteId: 'fte'
};

exports.start = function startFteModule(app, module)
{
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
      module.config.sioId,
      module.config.divisionsId,
      module.config.fteId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.fteId
    ],
    function()
    {
      app.broker.subscribe('shiftChanged', lockEntries);

      lockEntries();
    }
  );

  function lockEntries()
  {
    var HourlyPlan = app[module.config.mongooseId].model('HourlyPlan');
    var currentShift = app[module.config.fteId].getCurrentShift();
    var condition = {
      locked: false,
      $or: [{date: {$ne: currentShift.date}}, {shift: {$ne: currentShift.no}}]
    };

    HourlyPlan.find(condition, {flows: 0}, function(err, hourlyPlans)
    {
      if (err)
      {
        return module.error("Failed to lock plans: %s", err.message);
      }

      if (!hourlyPlans.length)
      {
        return;
      }

      module.info("Locking %d plans...", hourlyPlans.length);

      hourlyPlans.forEach(function(hourlyPlan)
      {
        hourlyPlan.lock(null, function(err)
        {
          if (err)
          {
            module.error("Failed to lock a plan (%s): %s", hourlyPlan.get('_id'), err.message);
          }
        });
      });
    });
  }
};
