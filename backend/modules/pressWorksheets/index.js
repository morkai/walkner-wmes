'use strict';

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
    }
  );

  function createOrdersAndDowntimes(message)
  {
    var PressWorksheet = app[module.config.mongooseId].model('PressWorksheet');

    PressWorksheet.findById(message.model._id, function(err, pressWorksheet)
    {
      if (err)
      {
        return module.error(
          "Failed to find press worksheet [%s]: %s", message.model._id, err.stack
        );
      }

      pressWorksheet.createOrdersAndDowntimes(function(err)
      {
        if (err)
        {
          return module.error(
            "Failed to create orders and downtimes from [%s]: %s", message.model._id, err.stack
          );
        }
      });
    });
  }
};
