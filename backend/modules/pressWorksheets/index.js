// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const setUpRoutes = require('./routes');

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
    const pressWorksheetId = message.model._id;

    createRelatedModels(pressWorksheetId, function(err)
    {
      if (err)
      {
        return module.error(
          'Failed to create orders and downtimes from [%s]: %s', pressWorksheetId, err.stack
        );
      }
    });
  }

  function recreateOrdersAndDowntimes(message)
  {
    const pressWorksheetId = message.model._id;

    removeRelatedModels(pressWorksheetId, function()
    {
      createRelatedModels(pressWorksheetId, function(err)
      {
        if (err)
        {
          return module.error(
            'Failed to recreate orders and downtimes from [%s]: %s', pressWorksheetId, err.stack
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
    const PressWorksheet = app[module.config.mongooseId].model('PressWorksheet');

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
    const mongoose = app[module.config.mongooseId];
    const ProdShiftOrder = mongoose.model('ProdShiftOrder');
    const ProdDowntime = mongoose.model('ProdDowntime');

    step(
      function removeRelatedModelsStep()
      {
        const doneRemovingOrders = this.parallel();
        const doneRemovingDowntimes = this.parallel();

        ProdShiftOrder.deleteMany({pressWorksheet: pressWorksheetId}, err =>
        {
          if (err)
          {
            return module.error(
              'Failed to remove orders for press worksheet [%s]: %s', pressWorksheetId, err.stack
            );
          }

          return doneRemovingOrders();
        });

        ProdDowntime.deleteMany({pressWorksheet: pressWorksheetId}, err =>
        {
          if (err)
          {
            return module.error(
              'Failed to remove downtimes for press worksheet [%s]: %s', pressWorksheetId, err.stack
            );
          }

          return doneRemovingDowntimes();
        });
      },
      done
    );
  }
};
