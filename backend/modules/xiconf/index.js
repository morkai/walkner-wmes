// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpImporter = require('./importer');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  directoryWatcherId: 'directoryWatcher',
  userId: 'user',
  featureDbPath: './',
  zipStoragePath: './',
  licenseEd: {
    pem: null,
    password: null
  }
};

exports.start = function startXiconfModule(app, module)
{
  var config = module.config;

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  module.licenseEdKey = null;

  if (config.licenseEd.pem)
  {
    var ursa = require('ursa');

    if (config.licenseEd.password)
    {
      module.licenseEdKey = ursa.createPrivateKey(config.licenseEd.pem, config.licenseEd.password);
    }
    else
    {
      module.licenseEdKey = ursa.createPrivateKey(config.licenseEd.pem);
    }
  }

  if (module.licenseEdKey)
  {
    app.onModuleReady(
      [
        config.mongooseId,
        config.directoryWatcherId
      ],
      setUpImporter.bind(null, app, module)
    );
  }
};
