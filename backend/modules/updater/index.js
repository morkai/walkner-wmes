'use strict';

var fs = require('fs');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var expressMiddleware = require('./expressMiddleware');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  sioId: 'sio',
  packageJsonPath: 'package.json',
  manifestPath: null,
  restartDelay: 15000,
  errorTemplate: 'error503',
  pull: {
    exe: 'git',
    cwd: process.cwd(),
    timeout: 60000
  }
};

exports.start = function startUpdaterModule(app, module)
{
  var reloadTimer = null;
  var restartTimer = null;

  module.config.packageJsonPath = require.resolve(module.config.packageJsonPath);

  module.package = reloadPackageJson();

  module.restarting = 0;

  module.manifest = module.config.manifestPath
    ? fs.readFileSync(module.config.manifestPath, 'utf8')
    : null;

  app.broker
    .subscribe('express.beforeMiddleware')
    .setLimit(1)
    .on('message', function(message)
    {
      message.module.use(expressMiddleware.bind(null, app, module));
    });

  app.onModuleReady(module.config.expressId, setUpRoutes.bind(null, app, module));

  app.onModuleReady(module.config.sioId, setUpCommands.bind(null, app, module));

  fs.watch(module.config.packageJsonPath, function()
  {
    if (reloadTimer !== null)
    {
      clearTimeout(reloadTimer);
    }

    reloadTimer = setTimeout(compareVersions, 1000);
  });

  function reloadPackageJson()
  {
    delete require.cache[module.config.packageJsonPath];

    module.package = require(module.config.packageJsonPath);

    return module.package;
  }

  function compareVersions()
  {
    reloadTimer = null;

    var oldBackendVersion = module.package.backendVersion;
    var oldFrontendVersion = module.package.frontendVersion;

    reloadPackageJson();

    if (module.package.backendVersion !== oldBackendVersion)
    {
      module.info(
        "Backend version changed from [%s] to [%s]...",
        oldBackendVersion,
        module.package.backendVersion
      );

      handleBackendUpdate(oldBackendVersion);
    }
    else if (module.package.frontendVersion !== oldFrontendVersion)
    {
      module.info(
        "Frontend version changed from [%s] to [%s]...",
        oldFrontendVersion,
        module.package.frontendVersion
      );

      handleFrontendUpdate(oldFrontendVersion);
    }
  }

  function handleBackendUpdate(oldBackendVersion)
  {
    module.restarting = Date.now();

    if (restartTimer !== null)
    {
      return;
    }

    module.info("Restarting in %d seconds...", module.config.restartDelay / 1000);

    restartTimer = setTimeout(restart, module.config.restartDelay);

    app.broker.publish('updater.newVersion', {
      service: 'backend',
      oldVersion: oldBackendVersion,
      newVersion: module.package.backendVersion,
      delay: module.config.restartDelay
    });
  }

  function handleFrontendUpdate(oldFrontendVersion)
  {
    app.broker.publish('updater.newVersion', {
      service: 'frontend',
      oldVersion: oldFrontendVersion,
      newVersion: module.package.frontendVersion
    });
  }

  function restart()
  {
    module.info("Exiting the process...");

    process.nextTick(process.exit.bind(process));
  }
};
