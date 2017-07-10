// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const setUpRoutes = require('./routes');
const setUpRemoteCoordinator = require('./remoteCoordinator');
const setUpResultsImporter = require('./importer/results');
const setUpNotifier = require('./notifier');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  sioId: 'sio',
  expressId: 'express',
  directoryWatcherId: 'directoryWatcher',
  productionId: 'production',
  userId: 'user',
  licensesId: 'licenses',
  mailSenderId: 'mail/sender',
  settingsId: 'settings',
  updaterId: 'updater',
  featureDbPath: './',
  zipStoragePath: './',
  emailUrlPrefix: 'http://127.0.0.1/',
  vncTemplatePath: __dirname + '/template.vnc',
  updatesPath: './'
};

exports.start = function startXiconfModule(app, module)
{
  const config = module.config;

  module.programSyncQueue = [];

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId,
      config.sioId,
      config.settingsId,
      config.licensesId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.directoryWatcherId,
      config.licensesId
    ],
    setUpResultsImporter.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.sioId,
      config.productionId,
      config.settingsId
    ],
    setUpRemoteCoordinator.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.mailSenderId,
      config.settingsId
    ],
    setUpNotifier.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.sioId
    ],
    resetClientsLastSeenAt
  );

  function resetClientsLastSeenAt()
  {
    const XiconfClient = app[config.mongooseId].model('XiconfClient');

    step(
      function findConnectedClientsStep()
      {
        XiconfClient.find({connectedAt: {$ne: null}}, {connectedAt: 1}).lean().exec(this.next());
      },
      function updateDisconnectedAtStep(err, xiconfClients)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (let i = 0; i < xiconfClients.length; ++i)
        {
          const xiconfClient = xiconfClients[i];
          const update = {
            connectedAt: null,
            disconnectedAt: xiconfClient.connectedAt
          };

          XiconfClient.collection.update({_id: xiconfClient._id}, {$set: update}, this.group());
        }
      },
      function(err)
      {
        if (err)
        {
          module.error("Failed to reset clients' last seen at time: %s", err.message);
        }
      }
    );
  }
};
