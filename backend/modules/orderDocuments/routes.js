// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpOrderDocumentsRoutes(app, module)
{
  var express = app[module.config.expressId];
  var userModule = app[module.config.userId];
  var mongoose = app[module.config.mongooseId];
  var updaterModule = app[module.config.updaterId];
  var orgUnits = app[module.config.orgUnitsId];
  var Order = mongoose.model('Order');

  express.get('/docs/:clientId', function(req, res)
  {
    res.format({
      'text/html': function()
      {
        res.render('index', {
          appCacheManifest: app.options.env !== 'development' ? 'orderDocuments/manifest.appcache' : '',
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

        if (!user.super && (user.privileges || []).indexOf('DICTIONARIES:MANAGE') === -1)
        {
          return this.skip(express.createHttpError('NO_PRIVILEGES'));
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
          return this.skip(express.createHttpError('INVALID_PROD_LINE'));
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

  express.get('/orderDocuments/clients', userModule.auth(), function(req, res)
  {
    res.json(module.getClients());
  });

  express.get('/orders/:orderNo/documents', userModule.auth('LOCAL'), function(req, res, next)
  {
    if (!_.isString(req.params.orderNo) || !/^[0-9]+$/.test(req.params.orderNo))
    {
      return next(express.createHttpError('INPUT'));
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
    findDocumentFilePath(req.params.nc15, function(err)
    {
      if (err)
      {
        return res.sendStatus(err.status);
      }

      return res.sendStatus(204);
    });
  });

  express.get('/orderDocuments/:nc15', userModule.auth('LOCAL'), function(req, res, next)
  {
    findDocumentFilePath(req.params.nc15, function(err, filePath)
    {
      if (err)
      {
        return next(err);
      }

      return res.sendFile(filePath);
    });
  });

  express.get('/orderDocuments;import', function(req, res, next)
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
      return done(express.createHttpError('INVALID_NC15'));
    }

    if (_.isEmpty(module.settings.path))
    {
      return done(express.createHttpError('NO_PATH_SETTING'));
    }

    var filePath = path.join(module.settings.path, nc15 + '.pdf');

    fs.stat(filePath, function(err)
    {
      if (err)
      {
        return done(express.createHttpError(err.code, err.code === 'ENOENT' ? 404 : 500));
      }

      return done(null, filePath);
    });
  }
};
