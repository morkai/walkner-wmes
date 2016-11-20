// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpLogEntryHandler = require('./logEntryHandler');
var setUpActiveProdLines = require('./activeProdLines');
var setUpProdData = require('./prodData');
var setUpProdState = require('./prodState');
var setUpAutoDowntimes = require('./autoDowntimes');
var recreate = require('./recreate');
var syncLogEntryStream = require('./syncLogEntryStream');
var checkSerialNumber = require('./checkSerialNumber');
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
  orgUnitsId: 'orgUnits',
  settingsId: 'settings',
  updaterId: 'updater',
  isaId: 'isa'
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
  module.checkSerialNumber = checkSerialNumber.bind(null, app, module);
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
      module.config.expressId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.userId,
      module.config.sioId,
      module.config.orgUnitsId,
      module.config.fteId,
      module.config.settingsId,
      module.config.isaId
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

  app.onModuleReady(
    [
      module.config.orgUnitsId
    ],
    setUpAutoDowntimes.bind(null, app, module)
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
