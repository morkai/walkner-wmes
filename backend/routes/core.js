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
  setUpFrontendVersionUpdater();

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

  function showIndex(req, res)
  {
    res.render('index', updaterModule.getAppTemplateData('frontend', req, {
      ROOT_USER,
      GUEST_USER,
      PRIVILEGES,
      MODULES,
      DASHBOARD_URL_AFTER_LOG_IN
    }));
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

  function reloadRequirejsConfig()
  {
    const configPath = require.resolve('../../config/require');

    delete require.cache[configPath];

    const requirejsConfig = require(configPath);

    requirejsPaths = JSON.stringify(requirejsConfig.paths);
    requirejsShim = JSON.stringify(requirejsConfig.shim);
  }

  function setUpFrontendVersionUpdater()
  {
    app.broker.subscribe('dictionaries.updated', () => updaterModule.updateFrontendVersion());
  }
};
