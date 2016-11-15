// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var findOrdersRoute = require('./findOrdersRoute');
var getProductionStateRoute = require('./getProductionStateRoute');
var getProductionHistoryRoute = require('./getProductionHistoryRoute');
var syncRoute = require('./syncRoute');

module.exports = function setUpProductionRoutes(app, productionModule)
{
  var express = app[productionModule.config.expressId];
  var settings = app[productionModule.config.settingsId];
  var userModule = app[productionModule.config.userId];
  var updaterModule = app[productionModule.config.updaterId];

  express.get('/operator', function(req, res)
  {
    var sessionUser = req.session.user;
    var locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

    res.format({
      'text/html': function()
      {
        res.render('index', {
          appCacheManifest: app.options.env !== 'development' ? '/operator/manifest.appcache' : '',
          appData: {
            ENV: JSON.stringify(app.options.env),
            VERSIONS: JSON.stringify(updaterModule ? updaterModule.getVersions() : {}),
            TIME: JSON.stringify(Date.now()),
            LOCALE: JSON.stringify(locale),
            FRONTEND_SERVICE: JSON.stringify('operator')
          },
          mainJsFile: 'wmes-operator.js',
          mainCssFile: 'assets/wmes-operator.css'
        });
      }
    });
  });

  express.get(
    '/production/settings',
    function limitToProductionSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^production\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/production/settings/:id', userModule.auth('PROD_DATA:MANAGE'), settings.updateRoute);

  express.get('/production/orders', findOrdersRoute.bind(null, app, productionModule));
  express.get('/production/state', getProductionStateRoute.bind(null, app, productionModule));
  express.get('/production/history', getProductionHistoryRoute.bind(null, app, productionModule));
  express.post('/prodLogEntries', syncRoute.bind(null, app, productionModule));
};
