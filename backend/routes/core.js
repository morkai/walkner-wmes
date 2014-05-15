// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function startCoreRoutes(app, express)
{
  var appCache = app.options.env === 'production';
  var requirejsPaths;
  var requirejsShim;

  app.broker.subscribe('updater.newVersion', reloadRequirejsConfig).setFilter(function(message)
  {
    return message.service === 'frontend';
  });

  reloadRequirejsConfig();

  if (app.updater)
  {
    [
      'prodFunctions',
      'companies',
      'divisions',
      'subdivisions',
      'mrpControllers',
      'prodFlows',
      'workCenters',
      'prodLines',
      'aors',
      'orderStatuses',
      'downtimeReasons'
    ].forEach(setUpFrontendVersionUpdater);
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

    // TODO: Add caching
    res.render('index', {
      appCache: appCache,
      appData: {
        VERSIONS: JSON.stringify({
          backend: app.updater.package.backendVersion,
          frontend: app.updater.package.frontendVersion
        }),
        TIME: JSON.stringify(Date.now()),
        LOCALE: JSON.stringify(locale),
        ROOT_USER: JSON.stringify(lodash.omit(app.user.root, 'password')),
        GUEST_USER: JSON.stringify(app.user.guest),
        PRIVILEGES: JSON.stringify(app.user.config.privileges),
        PROD_FUNCTIONS: JSON.stringify(app.prodFunctions.models),
        COMPANIES: JSON.stringify(app.companies.models),
        DIVISIONS: JSON.stringify(app.divisions.models),
        SUBDIVISIONS: JSON.stringify(app.subdivisions.models),
        MRP_CONTROLLERS: JSON.stringify(app.mrpControllers.models),
        PROD_FLOWS: JSON.stringify(app.prodFlows.models),
        WORK_CENTERS: JSON.stringify(app.workCenters.models),
        PROD_LINES: JSON.stringify(app.prodLines.models),
        AORS: JSON.stringify(app.aors.models),
        ORDER_STATUSES: JSON.stringify(app.orderStatuses.models),
        DOWNTIME_REASONS: JSON.stringify(app.downtimeReasons.models)
      }
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
    app.broker.subscribe(topicPrefix + '.added', app.updater.updateFrontendVersion);
    app.broker.subscribe(topicPrefix + '.edited', app.updater.updateFrontendVersion);
    app.broker.subscribe(topicPrefix + '.deleted', app.updater.updateFrontendVersion);
  }
};
