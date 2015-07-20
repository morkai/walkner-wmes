// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpLogEntryHandler = require('./logEntryHandler');
var setUpActiveProdLines = require('./activeProdLines');
var setUpProdData = require('./prodData');
var setUpProdState = require('./prodState');
var recreate = require('./recreate');
var syncLogEntryStream = require('./syncLogEntryStream');
var logEntryHandlers = require('./logEntryHandlers');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  subdivisionsId: 'subdivisions',
  prodLinesId: 'prodLines',
  downtimeReasonsId: 'downtimeReasons',
  fteId: 'fte',
  orgUnitsId: 'orgUnits'
};

exports.start = function startProductionModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  module.secretKeys = {};
  module.recreating = false;
  module.recreate = recreate.bind(null, app, module);
  module.syncLogEntryStream = syncLogEntryStream.bind(null, app, module);
  module.logEntryHandlers = logEntryHandlers;

  setUpProdData(app, module);

  app.onModuleReady(
    [
      module.config.orgUnitsId
    ],
    function()
    {
      cacheSecretKeys();
      setUpProdState(app, module);
    }
  );

  app.onModuleReady(
    [
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.userId,
      module.config.sioId,
      module.config.orgUnitsId,
      module.config.fteId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.fteId,
      module.config.orgUnitsId
    ],
    setUpActiveProdLines.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.subdivisionsId,
      module.config.prodLinesId,
      module.config.downtimeReasonsId
    ],
    setUpLogEntryHandler.bind(null, app, module)
  );

  app.broker.subscribe('shiftChanged', function clearProdDataCache()
  {
    app.timeout(30000, module.clearStaleProdData);
  });

  app.broker.subscribe('hourlyPlans.quantitiesPlanned', function(message)
  {
    if (!module.recreating)
    {
      app.broker.publish('production.edited.shift.' + message.prodShift, {
        quantitiesDone: message.quantitiesDone
      });
    }
  });

  app.broker.subscribe('prodLines.*', cacheSecretKeys);

  function cacheSecretKeys()
  {
    module.secretKeys = {};

    _.forEach(app[module.config.orgUnitsId].getAllByType('prodLine'), function(prodLine)
    {
      var secretKey = prodLine.secretKey;

      if (secretKey)
      {
        module.secretKeys[prodLine._id] = secretKey;
      }
    });
  }
};
