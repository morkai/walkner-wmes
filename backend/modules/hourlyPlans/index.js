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
  var recountTimers = {};

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
      module.config.orgUnitsId,
      module.config.prodShiftsId,
      module.config.fteId
    ],
    function()
    {
      app.broker.subscribe('production.prodLineActivated', function(message)
      {
        schedulePlannedQuantitiesRecountForProdFlow(
          message.shiftId, message.prodFlow, message.activeProdLinesInProdFlow
        );
      });

      app.broker.subscribe('hourlyPlans.updated.*', function(message)
      {
        scheduleAllPlannedQuantitiesRecount(message._id);
      });
    }
  );

  function schedulePlannedQuantitiesRecountForProdFlow(shiftId, prodFlowId, activeProdLineIds)
  {
    if (recountTimers[prodFlowId] !== undefined)
    {
      clearTimeout(recountTimers[prodFlowId]);
    }

    recountTimers[prodFlowId] = setTimeout(
      function()
      {
        delete recountTimers[prodFlowId];

        recountPlannedQuantities(shiftId, prodFlowId, activeProdLineIds);
      },
      5000
    );
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

  function scheduleAllPlannedQuantitiesRecount(hourlyPlanId)
  {
    if (recountTimers[hourlyPlanId] !== undefined)
    {
      clearTimeout(recountTimers[hourlyPlanId]);
    }

    recountTimers[hourlyPlanId] = setTimeout(
      function()
      {
        delete recountTimers[hourlyPlanId];

        findAndRecountPlannedQuantities(hourlyPlanId);
      },
      60000
    );
  }

  function findAndRecountPlannedQuantities(hourlyPlanId)
  {
    var HourlyPlan = app[module.config.mongooseId].model('HourlyPlan');

    HourlyPlan.findById(hourlyPlanId).exec(function(err, hourlyPlan)
    {
      if (err)
      {
        return module.error(
          "Failed to find hourly plan [%s] to recount planned quantities: %s",
          hourlyPlanId,
          err.stack
        );
      }

      hourlyPlan.recountPlannedQuantities();
    });
  }
};
