// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var helpers = require('./routes/helpers');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  orgUnitsId: 'orgUnits',
  prodTasksId: 'prodTasks',
  downtimeReasonsId: 'downtimeReasons',
  prodFunctionsId: 'prodFunctions',
  javaBatik: null
};

exports.start = function startReportsModule(app, module)
{
  module.prodNumConstant = 8;

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.orgUnitsId,
      module.config.settingsId,
      module.config.prodTasksId,
      module.config.downtimeReasonsId,
      module.config.prodFunctionsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(module.config.settingsId, function()
  {
    app[module.config.settingsId].findById('reports.prodNumConstant.coeff', function(err, setting)
    {
      if (err)
      {
        return module.error("Failed to find the prodNumConstant setting: %s", err.message);
      }

      if (setting)
      {
        var value = parseFloat(setting.value);

        if (!isNaN(value) && value > 0)
        {
          module.prodNumConstant = value;
        }
      }
    });
  });

  app.broker.subscribe('settings.updated.reports.prodNumConstant.coeff', function(message)
  {
    if (typeof message.value === 'number' && message.value > 0)
    {
      module.prodNumConstant = message.value;

      helpers.clearCachedReports(['1', '2', '4']);
    }
  });
};
