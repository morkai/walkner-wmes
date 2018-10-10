// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const setUpRoutes = require('./routes');
const setUpCommands = require('./commands');
const setUpLogEntryHandler = require('./logEntryHandler');
const setUpActiveProdLines = require('./activeProdLines');
const setUpProdData = require('./prodData');
const setUpProdState = require('./prodState');
const setUpAutoDowntimes = require('./autoDowntimes');
const recreate = require('./recreate');
const syncLogEntryStream = require('./syncLogEntryStream');
const checkSerialNumber = require('./checkSerialNumber');
const getOrderQueue = require('./getOrderQueue');
const logEntryHandlers = require('./logEntryHandlers');

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
  isaId: 'isa',
  mysqlId: 'mysql'
};

exports.start = function startProductionModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('mongoose module is required!');
  }

  module.secretKeys = {};
  module.settings = {};
  module.bomCache = new Map();

  module.recreating = false;
  module.recreate = recreate.bind(null, app, module);
  module.syncLogEntryStream = syncLogEntryStream.bind(null, app, module);
  module.checkSerialNumber = checkSerialNumber.bind(null, app, module);
  module.getOrderQueue = getOrderQueue.bind(null, app, module);
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
      module.config.settingsId
    ],
    cacheSettings
  );

  app.onModuleReady(
    [
      module.config.userId,
      module.config.expressId,
      module.config.settingsId,
      module.config.fteId,
      module.config.orgUnitsId
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
      module.config.orgUnitsId,
      module.config.settingsId
    ],
    setUpAutoDowntimes.bind(null, app, module)
  );

  app.broker.subscribe('shiftChanged', function clearProdDataCache()
  {
    app.timeout(30000, module.clearStaleProdData);

    module.bomCache.clear();
  });

  app.broker.subscribe('ordersBomMatchers.**', () => module.bomCache.clear());

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
      const secretKey = prodLine.secretKey;

      if (secretKey)
      {
        module.secretKeys[prodLine._id] = secretKey;
      }
    });
  }

  function cacheSettings()
  {
    module.settings = {};

    app.broker.subscribe('settings.updated.production.**', function(message)
    {
      module.settings[message._id.replace('production.', '')] = message.value;
    });

    app[module.config.settingsId].findValues({_id: /^production/}, 'production.', function(err, settings)
    {
      if (err)
      {
        module.error(`Failed to cache settings: ${err.message}`);
      }
      else if (settings)
      {
        module.settings = settings;
      }
    });
  }
};
