// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const _ = require('lodash');

module.exports = function startCoreRoutes(app, express)
{
  const dev = app.options.env === 'development';
  const updaterModule = app[app.options.updaterId || 'updater'];
  const userModule = app[app.options.userId || 'user'];

  const ROOT_USER = userModule ? JSON.stringify(_.omit(userModule.root, 'password')) : '{}';
  const GUEST_USER = userModule ? JSON.stringify(userModule.guest) : '{}';
  const PRIVILEGES = userModule ? JSON.stringify(userModule.config.privileges) : '[]';
  const MODULES = JSON.stringify(app.options.modules.map(m => m.id || m));
  const DASHBOARD_URL_AFTER_LOG_IN = JSON.stringify(app.options.dashboardUrlAfterLogIn || '/');

  let requirejsPaths = null;
  let requirejsShim = null;

  app.broker
    .subscribe('updater.newVersion', reloadRequirejsConfig)
    .setFilter(message => message.service === app.options.id);

  reloadRequirejsConfig();

  if (updaterModule && app.options.dictionaryModules)
  {
    _.forEach(Object.keys(app.options.dictionaryModules), setUpFrontendVersionUpdater);
  }

  express.get('/', showIndex);

  express.get('/redirect', redirectRoute);

  express.options('/time', (req, res) =>
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
  });

  express.get('/time', (req, res) =>
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.send(Date.now().toString());
  });

  express.get('/config.js', sendRequireJsConfig);

  express.get('/favicon.ico', sendFavicon);

  function showIndex(req, res)
  {
    const sessionUser = req.session.user;
    const locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';
    const appData = {
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

    _.forEach(app.options.dictionaryModules, (appDataKey, moduleName) =>
    {
      const dictionaryModule = app[moduleName];

      if (!dictionaryModule)
      {
        return;
      }

      const models = app[moduleName].models;

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

      appData[appDataKey] = JSON.stringify(_.invokeMap(models, 'toDictionaryObject'));
    });

    _.forEach(app.options.frontendAppData, function(appDataValue, appDataKey)
    {
      appData[appDataKey] = JSON.stringify(
        _.isFunction(appDataValue) ? appDataValue(app) : appDataValue
      );
    });

    let appCacheManifest = '';
    const matches = (req.headers['user-agent'] || '').match(/Chrome\/([0-9]+)/);
    const chromeVersion = matches ? +matches[1] : 99;

    if (app.updater && !dev && (chromeVersion < 70 || req.secure))
    {
      _.forEach(app.updater.config.manifests, function(manifest)
      {
        if (manifest.frontendVersionKey === 'frontend' || !manifest.frontendVersionKey)
        {
          appCacheManifest = manifest.path;
        }
      });
    }

    res.render('index', {
      appCacheManifest: appCacheManifest,
      appData: appData,
      mainJsFile: app.options.mainJsFile || 'main.js',
      mainCssFile: app.options.mainCssFile || 'assets/main.css'
    });
  }

  function redirectRoute(req, res)
  {
    res.redirect(req.query.referrer || '/');
  }

  function sendRequireJsConfig(req, res)
  {
    res.type('js');
    res.render('config.js.ejs', {
      paths: requirejsPaths,
      shim: requirejsShim
    });
  }

  function sendFavicon(req, res)
  {
    const faviconPath = path.join(
      express.config[dev ? 'staticPath' : 'staticBuildPath'],
      app.options.faviconFile || 'favicon.ico'
    );

    res.type('image/x-icon');
    res.sendFile(faviconPath);
  }

  function reloadRequirejsConfig()
  {
    const configPath = require.resolve('../../config/require');

    delete require.cache[configPath];

    const requirejsConfig = require(configPath);

    requirejsPaths = JSON.stringify(requirejsConfig.paths);
    requirejsShim = JSON.stringify(requirejsConfig.shim);
  }

  function setUpFrontendVersionUpdater(topicPrefix)
  {
    app.broker.subscribe(`${topicPrefix}.added`, updaterModule.updateFrontendVersion);
    app.broker.subscribe(`${topicPrefix}.edited`, updaterModule.updateFrontendVersion);
    app.broker.subscribe(`${topicPrefix}.deleted`, updaterModule.updateFrontendVersion);
  }
};
