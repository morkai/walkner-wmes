// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function startCoreRoutes(app, express)
{
  var appCache = app.options.env !== 'development';
  var updaterModule = app[app.options.updaterId || 'updater'];
  var userModule = app[app.options.userId || 'user'];
  var requirejsPaths;
  var requirejsShim;

  var ROOT_USER = JSON.stringify(_.omit(userModule.root, 'password'));
  var GUEST_USER = JSON.stringify(userModule.guest);
  var PRIVILEGES = JSON.stringify(userModule.config.privileges);
  var MODULES = JSON.stringify(app.options.modules.map(function(module)
  {
    return module.id || module;
  }));
  var DASHBOARD_URL_AFTER_LOG_IN = JSON.stringify(app.options.dashboardUrlAfterLogIn || '/');

  app.broker.subscribe('updater.newVersion', reloadRequirejsConfig).setFilter(function(message)
  {
    return message.service === app.options.id;
  });

  reloadRequirejsConfig();

  if (updaterModule && app.options.dictionaryModules)
  {
    _.forEach(Object.keys(app.options.dictionaryModules), setUpFrontendVersionUpdater);
  }

  express.get('/', showIndex);

  express.get('/time', function(req, res)
  {
    res.send(Date.now().toString());
  });

  express.get('/ping', function(req, res)
  {
    res.type('text/plain');
    res.send('pong');
  });

  express.get('/config.js', sendRequireJsConfig);

  function showIndex(req, res)
  {
    var sessionUser = req.session.user;
    var locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';
    var appData = {
      ENV: JSON.stringify(app.options.env),
      VERSIONS: JSON.stringify(updaterModule ? updaterModule.getVersions() : {}),
      TIME: JSON.stringify(Date.now()),
      LOCALE: JSON.stringify(locale),
      ROOT_USER: ROOT_USER,
      GUEST_USER: GUEST_USER,
      PRIVILEGES: PRIVILEGES,
      MODULES: MODULES,
      DASHBOARD_URL_AFTER_LOG_IN: DASHBOARD_URL_AFTER_LOG_IN
    };

    _.forEach(app.options.dictionaryModules, function(appDataKey, moduleName)
    {
      var models = app[moduleName].models;

      if (models.length === 0)
      {
        appData[appDataKey] = '[]';

        return;
      }

      if (typeof models[0].toDictionaryObject !== 'function')
      {
        appData[appDataKey] = JSON.stringify(models);

        return;
      }

      appData[appDataKey] = JSON.stringify(_.invoke(models, 'toDictionaryObject'));
    });

    res.render('index', {
      appCache: appCache,
      appData: appData,
      mainJsFile: app.options.mainJsFile || 'main.js',
      mainCssFile: app.options.mainCssFile || 'assets/main.css'
    });
  }

  function sendRequireJsConfig(req, res)
  {
    res.type('js');
    res.render('config.js.ejs', {
      paths: requirejsPaths,
      shim: requirejsShim
    });
  }

  function reloadRequirejsConfig()
  {
    var configPath = require.resolve('../../config/require');

    delete require.cache[configPath];

    var requirejsConfig = require(configPath);

    requirejsPaths = JSON.stringify(requirejsConfig.paths);
    requirejsShim = JSON.stringify(requirejsConfig.shim);
  }

  function setUpFrontendVersionUpdater(topicPrefix)
  {
    app.broker.subscribe(topicPrefix + '.added', updaterModule.updateFrontendVersion);
    app.broker.subscribe(topicPrefix + '.edited', updaterModule.updateFrontendVersion);
    app.broker.subscribe(topicPrefix + '.deleted', updaterModule.updateFrontendVersion);
  }
};
