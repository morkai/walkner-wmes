// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var fresh = require('fresh');
var step = require('h5.step');

module.exports = function setUpOrderDocumentsRoutes(app, module)
{
  var express = app[module.config.expressId];
  var userModule = app[module.config.userId];
  var updaterModule = app[module.config.updaterId];
  var orgUnits = app[module.config.orgUnitsId];
  var mongoose = app[module.config.mongooseId];
  var Order = mongoose.model('Order');
  var OrderDocumentClient = mongoose.model('OrderDocumentClient');
  var License = mongoose.model('License');

  var SPECIAL_DOCUMENTS = {
    BOM: handleBomDocument,
    ETO: handleEtoDocument
  };

  var canView = userModule.auth('DOCUMENTS:VIEW');
  var canManage = userModule.auth('DOCUMENTS:MANAGE');

  var nc15ToFreshHeaders = {};

  express.get('/docs/:clientId', function(req, res)
  {
    res.format({
      'text/html': function()
      {
        res.render('index', {
          appCacheManifest: app.options.env !== 'development' ? '/orderDocuments/manifest.appcache' : '',
          appData: {
            ENV: JSON.stringify(app.options.env),
            VERSIONS: JSON.stringify(updaterModule ? updaterModule.getVersions() : {}),
            CLIENT_ID: JSON.stringify(req.params.clientId)
          },
          mainJsFile: 'wmes-docs.js',
          mainCssFile: 'assets/wmes-docs.css'
        });
      }
    });
  });

  express.post('/docs/:clientId', function(req, res, next)
  {
    step(
      function authenticateStep()
      {
        userModule.authenticate({login: req.body.login, password: req.body.password}, this.next());
      },
      function authorizeStep(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user.super && !_.includes(user.privileges, 'DOCUMENTS:ACTIVATE'))
        {
          return this.skip(app.createError('NO_PRIVILEGES', 403));
        }
      },
      function checkProdLineStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        var prodLine = orgUnits.getByTypeAndId('prodLine', req.body.prodLineId);

        if (!prodLine)
        {
          return this.skip(app.createError('INVALID_PROD_LINE', 400));
        }
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        res.sendStatus(204);
      }
    );
  });

  express.get('/orderDocuments/licensing', canView, getClientLicensingRoute);

  express.get(
    '/orderDocuments/clients',
    canView,
    express.crud.browseRoute.bind(null, app, OrderDocumentClient)
  );

  express.delete(
    '/orderDocuments/clients/:id',
    canManage,
    express.crud.deleteRoute.bind(null, app, OrderDocumentClient)
  );

  express.get('/orders/:orderNo/documents', userModule.auth('LOCAL'), function(req, res, next)
  {
    if (!_.isString(req.params.orderNo) || !/^[0-9]+$/.test(req.params.orderNo))
    {
      return next(app.createError('INPUT', 400));
    }

    module.findOrderData(req.params.orderNo, function(err, orderData)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(orderData);
    });
  });

  express.head('/orderDocuments/:nc15', userModule.auth('LOCAL'), function(req, res, next)
  {
    var nc15 = req.params.nc15;

    if (SPECIAL_DOCUMENTS[nc15])
    {
      return SPECIAL_DOCUMENTS[nc15](req, res, next);
    }

    findDocumentFilePath(nc15, function(err, results)
    {
      if (err)
      {
        return res.sendStatus(404);
      }

      res.set('X-Document-Source', results.source);

      return res.sendStatus(204);
    });

    module.checkRemoteServer(nc15);
  });

  express.get('/orderDocuments/:nc15', userModule.auth('LOCAL'), function(req, res, next)
  {
    var nc15 = req.params.nc15;

    if (SPECIAL_DOCUMENTS[nc15])
    {
      return SPECIAL_DOCUMENTS[nc15](req, res, next);
    }

    var freshHeaders = nc15ToFreshHeaders[nc15];

    if (freshHeaders && fresh(req.headers, freshHeaders))
    {
      res.set(freshHeaders);
      res.sendStatus(304);

      return;
    }

    findDocumentFilePath(nc15, function(err, results)
    {
      if (err)
      {
        if (err.code === 'ENOENT')
        {
          return res.sendStatus(404);
        }

        return next(err);
      }

      return res.sendFile(results.filePath, {maxAge: 60 * 1000}, function(err)
      {
        if (err)
        {
          return next(err);
        }

        nc15ToFreshHeaders[nc15] = _.pick(res._headers, ['etag', 'last-modified', 'cache-control']);

        setTimeout(function() { delete nc15ToFreshHeaders[nc15]; }, 60 * 1000);
      });
    });
  });

  express.post('/orderDocuments;import', function(req, res, next)
  {
    res.type('text/plain');

    if (!req.is('text/plain'))
    {
      return res.status(400).send('INVALID_CONTENT_TYPE');
    }

    var timestamp = parseInt(req.query.timestamp, 10);
    var step = parseInt(req.query.step, 10);

    if (isNaN(timestamp) || isNaN(step) || req.body.length < 256)
    {
      return res.status(400).send('INPUT');
    }

    var importFile = module.config.importFile
      .replace('{timestamp}', timestamp)
      .replace('{step}', step);

    fs.writeFile(path.join(module.config.importPath, importFile), req.body, function(err)
    {
      if (err)
      {
        return next(err);
      }

      return res.sendStatus(204);
    });
  });

  function findDocumentFilePath(nc15, done)
  {
    if (!/^[0-9]+$/.test(nc15))
    {
      return done(app.createError('INVALID_NC15', 400));
    }

    if (_.isEmpty(module.settings.path))
    {
      return done(app.createError('NO_PATH_SETTING', 503));
    }

    var cachedFilePath = path.join(module.config.cachedPath, nc15 + '.pdf');
    var localFilePath = path.join(module.settings.path, nc15 + '.pdf');

    step(
      function()
      {
        fs.stat(localFilePath, this.parallel());

        if (!_.isEmpty(module.settings.remoteServer))
        {
          fs.stat(cachedFilePath, this.parallel());
        }
      },
      function(err, localStats, cachedStats)
      {
        if (cachedStats)
        {
          return done(null, {filePath: cachedFilePath, source: 'search'});
        }

        if (localStats)
        {
          return done(null, {filePath: localFilePath, source: 'remote'});
        }

        return done(err);
      }
    );
  }

  function getClientLicensingRoute(req, res, next)
  {
    step(
      function findModelsStep()
      {
        License.find({appId: 'wmes-docs'}, {features: 1}).exec(this.parallel());
        OrderDocumentClient.count().exec(this.parallel());
      },
      function sendResponseStep(err, licenses, clientCount)
      {
        if (err)
        {
          return next(err);
        }

        return res.send({
          licenseCount: licenses.reduce(function(total, license) { return total + license.features; }, 0),
          clientCount: clientCount
        });
      }
    );
  }

  function handleBomDocument(req, res, next)
  {
    Order.findById(req.query.order, {qty: 1, bom: 1}).lean().exec(function(err, order)
    {
      if (err)
      {
        return next(err);
      }

      if (!order)
      {
        return next(app.createError('ORDER_NOT_FOUND', 404));
      }

      if (req.method === 'HEAD')
      {
        return res.sendStatus(204);
      }

      res.render('orderDocuments:bom', {
        order: order._id,
        components: _.map(order.bom, function(component)
        {
          var qty = component.qty;

          if (component.nc12)
          {
            qty /= order.qty;
          }

          qty = qty.toString().split('.');

          component.qty = [
            parseInt(qty[0], 10),
            +(parseInt(qty[1], 10) || 0).toString().substring(0, 3)
          ];

          return component;
        }),
        windowWidth: parseInt(req.query.w, 10) || 0,
        windowHeight: parseInt(req.query.h, 10) || 0
      });
    });
  }

  function handleEtoDocument(req, res, next)
  {
    Order.findById(req.query.order, {nc12: 1}).lean().exec(function(err, order)
    {
      if (err)
      {
        return next(err);
      }

      if (!order)
      {
        return next(app.createError('ORDER_NOT_FOUND', 404));
      }

      if (req.method === 'HEAD')
      {
        return res.sendStatus(204);
      }

      fs.readFile(path.join(module.config.etoPath, order.nc12 + '.html'), 'utf8', function(err, etoTableHtml)
      {
        res.render('orderDocuments:eto', {
          order: order._id,
          nc12: order.nc12,
          etoTableHtml: etoTableHtml,
          header: req.query.header !== '0'
        });
      });
    });
  }
};
