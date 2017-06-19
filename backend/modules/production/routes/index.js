// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');
var findOrdersRoute = require('./findOrdersRoute');
var getProductionStateRoute = require('./getProductionStateRoute');
var getProductionHistoryRoute = require('./getProductionHistoryRoute');
var syncRoute = require('./syncRoute');
var checkSerialNumberRoute = require('./checkSerialNumberRoute');
var getRecentPersonnelRoute = require('./getRecentPersonnelRoute');

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
  express.get('/production/getRecentPersonnel', getRecentPersonnelRoute.bind(null, app, productionModule));
  express.post('/production/checkSerialNumber', checkSerialNumberRoute.bind(null, app, productionModule));
  express.post('/prodLogEntries', syncRoute.bind(null, app, productionModule));

  express.get('/production/reloadLine/:line', userModule.auth('SUPER'), function(req, res, next)
  {
    const lineState = productionModule.getProdLineState(req.params.line);

    if (!lineState)
    {
      return next(app.createError('LINE_NOT_FOUND', 400));
    }

    step(
      function()
      {
        const ProdShift = app[productionModule.config.mongooseId].model('ProdShift');
        const date = app[productionModule.config.fteId].currentShift.date;
        const prodLine = lineState.prodLine._id;

        ProdShift
          .findOne({prodLine, date}, {_id: 1})
          .lean()
          .exec(this.parallel());

        ProdShift
          .findOne({_id: req.query.prodShift}, {_id: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, currentProdShift, newProdShift)
      {
        if (err)
        {
          return next(err);
        }

        if (!currentProdShift)
        {
          return next(app.createError('SHIFT_NOT_FOUND', 400));
        }

        const changes = {
          prodShift: {_id: newProdShift ? newProdShift._id : currentProdShift._id},
          prodShiftOrder: null,
          prodDowntime: null
        };
        const options = {
          reloadOrders: true,
          reloadDowntimes: true
        };

        lineState.update(changes, options);

        res.json(changes.prodShift._id);
      }
    );
  });
};
