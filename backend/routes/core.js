// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = (app, express) =>
{
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
    .setFilter(message => message.service === 'frontend');

  reloadRequirejsConfig();
  setUpFrontendVersionUpdater();

  express.get('/', showIndex);

  express.get('/redirect', redirectRoute);

  express.options('/time', (req, res) =>
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
    res.end();
  });

  express.get('/time', (req, res) =>
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
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
      cache: false,
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
