// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  userId: 'user',
  expressId: 'express'
};

exports.start = function startPressWorksheetsModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    function()
    {
      setUpRoutes(app, module);

      app.broker.subscribe('pressWorksheets.added', createOrdersAndDowntimes);
      app.broker.subscribe('pressWorksheets.edited', recreateOrdersAndDowntimes);
      app.broker.subscribe('pressWorksheets.deleted', removeOrdersAndDowntimes);
    }
  );

  function createOrdersAndDowntimes(message)
  {
    var pressWorksheetId = message.model._id;

    createRelatedModels(pressWorksheetId, function(err)
    {
      if (err)
      {
        return module.error(
          "Failed to create orders and downtimes from [%s]: %s", pressWorksheetId, err.stack
        );
      }
    });
  }

  function recreateOrdersAndDowntimes(message)
  {
    var pressWorksheetId = message.model._id;

    removeRelatedModels(pressWorksheetId, function()
    {
      createRelatedModels(pressWorksheetId, function(err)
      {
        if (err)
        {
          return module.error(
            "Failed to recreate orders and downtimes from [%s]: %s", pressWorksheetId, err.stack
          );
        }
      });
    });
  }

  function removeOrdersAndDowntimes(message)
  {
    removeRelatedModels(message.model._id, function() {});
  }

  function createRelatedModels(pressWorksheetId, done)
  {
    var PressWorksheet = app[module.config.mongooseId].model('PressWorksheet');

    PressWorksheet.findById(pressWorksheetId, function(err, pressWorksheet)
    {
      if (err)
      {
        return done(err);
      }

      pressWorksheet.createOrdersAndDowntimes(done);
    });
  }

  function removeRelatedModels(pressWorksheetId, done)
  {
    var mongoose = app[module.config.mongooseId];
    var ProdShiftOrder = mongoose.model('ProdShiftOrder');
    var ProdDowntime = mongoose.model('ProdDowntime');

    step(
      function removeRelatedModelsStep()
      {
        var doneRemovingOrders = this.parallel();
        var doneRemovingDowntimes = this.parallel();

        ProdShiftOrder.remove({pressWorksheet: pressWorksheetId}, function(err)
        {
          if (err)
          {
            return module.error(
              "Failed to remove orders for press worksheet [%s]: %s", pressWorksheetId, err.stack
            );
          }

          return doneRemovingOrders();
        });

        ProdDowntime.remove({pressWorksheet: pressWorksheetId}, function(err)
        {
          if (err)
          {
            return module.error(
              "Failed to remove downtimes for press worksheet [%s]: %s", pressWorksheetId, err.stack
            );
          }

          return doneRemovingDowntimes();
        });
      },
      done
    );
  }
};
