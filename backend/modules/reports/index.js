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
  messengerClientId: null,
  messengerType: 'request',
  javaBatik: null,
  reports: ['1', '2', '3', '4', '5', '6', '7', '8']
};

exports.start = function startReportsModule(app, module)
{
  var totalCountCache = {};

  module.helpers = helpers;
  module.prodNumConstant = 8;
  module.mapReduceResults = {};

  module.getCachedTotalCount = function(key)
  {
    return totalCountCache[key];
  };

  module.setCachedTotalCount = function(key, totalCount)
  {
    totalCountCache[key] = totalCount;
  };

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
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

  app.broker.subscribe('settings.updated.reports.lean.**', function()
  {
    helpers.clearCachedReports('8');
  });

  app.broker.subscribe('warehouse.shiftMetrics.updated', function()
  {
    helpers.clearCachedReports('6');
  });

  app.broker.subscribe('clipOrderCount.created', function()
  {
    helpers.clearCachedReports(['2', '7']);
  });

  app.broker.subscribe('orders.synced', function()
  {
    totalCountCache = {};
  });
};
