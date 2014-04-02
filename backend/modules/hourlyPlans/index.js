'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  divisionsId: 'divisions',
  fteId: 'fte',
  orgUnitsId: 'orgUnits',
  prodShiftsId: 'prodShifts'
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

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.orgUnitsId,
      module.config.prodShiftsId,
      module.config.fteId
    ],
    function()
    {
      app.broker.subscribe('production.prodLineActivated', function(message)
      {
        recountPlannedQuantities(
          message.shiftId, message.prodFlow, message.activeProdLinesInProdFlow
        );
      });
    }
  );

  function lockEntries()
  {
    var HourlyPlan = app[module.config.mongooseId].model('HourlyPlan');
    var currentShift = app[module.config.fteId].getCurrentShift();
    var condition = {
      locked: false,
      date: {$ne: currentShift.date}
    };

    HourlyPlan.find(condition, function(err, hourlyPlans)
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

  function recountPlannedQuantities(shiftId, prodFlowId, activeProdLineIds)
  {
    module.debug("Recounting planned quantities for prod flow [%s]...", prodFlowId);

    var division = app[module.config.orgUnitsId].getDivisionFor('prodFlow', prodFlowId);

    if (!division)
    {
      return module.error("Couldn't find a division for prod flow [%s]", prodFlowId);
    }

    app[module.config.mongooseId].model('HourlyPlan').recountPlannedQuantities(
      division._id,
      shiftId,
      prodFlowId,
      activeProdLineIds,
      function(err, prodShifts)
      {
        if (err)
        {
          return module.error(
            "Failed to recount planned quantities for prod flow [%s]: %s", prodFlowId, err.stack
          );
        }

        if (!Array.isArray(prodShifts) || !prodShifts.length)
        {
          return;
        }

        prodShifts.forEach(function(prodShift)
        {
          app.broker.publish('hourlyPlans.quantitiesPlanned', {
            prodLine: prodShift.prodLine,
            prodShift: prodShift._id,
            date: prodShift.date,
            quantitiesDone: prodShift.toJSON().quantitiesDone
          });
        });
      }
    );
  }
};
