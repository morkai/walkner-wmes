// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var setUpRoutes = require('./routes');
var setUpRemoteCoordinator = require('./remoteCoordinator');
var setUpResultsImporter = require('./importer/results');
var setUpNotifier = require('./notifier');

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
  featureDbPath: './',
  zipStoragePath: './',
  ordersImportPath: './',
  ordersImportFile: '{timestamp}@T_COOIS_XICONF_{step}.txt',
  emailUrlPrefix: 'http://127.0.0.1/',
  vncTemplatePath: __dirname + '/template.vnc',
  updatesPath: './'
};

exports.start = function startXiconfModule(app, module)
{
  var config = module.config;

  module.programSyncQueue = [];

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId,
      config.sioId,
      config.settingsId
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
      config.mongooseId
    ],
    resetClientsLastSeenAt
  );

  function resetClientsLastSeenAt()
  {
    var XiconfClient = app[config.mongooseId].model('XiconfClient');

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

        for (var i = 0; i < xiconfClients.length; ++i)
        {
          var xiconfClient = xiconfClients[i];
          var update = {
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
