// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const findOrdersRoute = require('./findOrdersRoute');
const getProductionStateRoute = require('./getProductionStateRoute');
const getProductionHistoryRoute = require('./getProductionHistoryRoute');
const syncRoute = require('./syncRoute');
const checkSerialNumberRoute = require('./checkSerialNumberRoute');
const checkBomSerialNumberRoute = require('./checkBomSerialNumberRoute');
const getRecentPersonnelRoute = require('./getRecentPersonnelRoute');

module.exports = function setUpProductionRoutes(app, productionModule)
{
  const express = app[productionModule.config.expressId];
  const settings = app[productionModule.config.settingsId];
  const orgUnits = app[productionModule.config.orgUnitsId];
  const userModule = app[productionModule.config.userId];
  const updaterModule = app[productionModule.config.updaterId];

  const canView = userModule.auth('LOCAL', 'USER');

  express.get('/operator', function(req, res)
  {
    const sessionUser = req.session.user;
    const locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

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
  express.put(
    '/production/settings/:id',
    userModule.auth('PROD_DATA:MANAGE', 'PROD_DATA:MANAGE:SPIGOT_ONLY'),
    settings.updateRoute
  );

  express.get('/production/orders', canView, findOrdersRoute.bind(null, app, productionModule));
  express.get('/production/state', canView, getProductionStateRoute.bind(null, app, productionModule));
  express.get('/production/history', canView, getProductionHistoryRoute.bind(null, app, productionModule));
  express.get('/production/getRecentPersonnel', canView, getRecentPersonnelRoute.bind(null, app, productionModule));
  express.post('/production/checkSerialNumber', canView, checkSerialNumberRoute.bind(null, app, productionModule));
  express.post(
    '/production/checkBomSerialNumber',
    canView,
    checkBomSerialNumberRoute.bind(null, app, productionModule)
  );
  express.post('/prodLogEntries', canView, syncRoute.bind(null, app, productionModule));

  express.get('/production/orderQueue/:shift', canView, (req, res, next) =>
  {
    productionModule.getOrderQueue(req.params.shift, (err, orderQueue) =>
    {
      if (err)
      {
        return next(err);
      }

      res.json(orderQueue);
    });
  });

  express.get('/production/reloadLine/:line', userModule.auth('SUPER'), function(req, res, next)
  {
    const lineState = productionModule.getProdLineState(orgUnits.fix.prodLine(req.params.line));

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
