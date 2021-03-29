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

  const requirejs = {
    packages: null,
    paths: null,
    shim: null
  };

  app.broker
    .subscribe('updater.newVersion', reloadRequirejsConfig)
    .setFilter(message => message.service === 'frontend');

  reloadRequirejsConfig();
  setUpFrontendVersionUpdater();

  express.get('/', showIndex);

  express.get('/redirect', redirectRoute);

  express.get('/config.js', sendRequireJsConfig);

  express.options('/ping', cors, (req, res) => res.end());
  express.get('/ping', cors, (req, res) => res.format({
    text: () =>
    {
      res.send('pong');
    },
    json: () =>
    {
      res.json('pong');
    }
  }));

  express.options('/time', cors, (req, res) => res.end());
  express.get('/time', cors, (req, res) =>
  {
    res.send(Date.now().toString());
  });

  function showIndex(req, res, next)
  {
    if (!updaterModule)
    {
      return next(app.createError('No app available.', 'SERVICE_UNAVAILABLE', 503));
    }

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
      packages: requirejs.packages,
      paths: requirejs.paths,
      shim: requirejs.shim
    });
  }

  function reloadRequirejsConfig()
  {
    const configPath = require.resolve('../../config/require');

    delete require.cache[configPath];

    const requirejsConfig = require(configPath);

    requirejs.packages = JSON.stringify(requirejsConfig.packages);
    requirejs.paths = JSON.stringify(requirejsConfig.paths);
    requirejs.shim = JSON.stringify(requirejsConfig.shim);
  }

  function setUpFrontendVersionUpdater()
  {
    app.broker.subscribe('dictionaries.updated', () => updaterModule.updateFrontendVersion());
  }

  function cors(req, res, next)
  {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '');

    next();
  }
};
