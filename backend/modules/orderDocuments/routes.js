// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const fresh = require('fresh');
const step = require('h5.step');
const moment = require('moment');
const multer = require('multer');
const {transliterate} = require('transliteration');

module.exports = function setUpOrderDocumentsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const updaterModule = app[module.config.updaterId];
  const orgUnits = app[module.config.orgUnitsId];
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const OrderDocumentFile = mongoose.model('OrderDocumentFile');
  const OrderDocumentFolder = mongoose.model('OrderDocumentFolder');
  const OrderDocumentName = mongoose.model('OrderDocumentName');
  const OrderDocumentClient = mongoose.model('OrderDocumentClient');
  const OrderDocumentUpload = mongoose.model('OrderDocumentUpload');
  const License = mongoose.model('License');

  const SPECIAL_DOCUMENTS = {
    BOM: handleBomDocument,
    ETO: handleEtoDocument
  };

  const canView = userModule.auth('DOCUMENTS:VIEW');
  const canViewUser = userModule.auth('USER', 'DOCUMENTS:VIEW');
  const canViewLocal = userModule.auth('LOCAL', 'USER', 'DOCUMENTS:VIEW');
  const canManage = userModule.auth('DOCUMENTS:MANAGE');

  const nc15ToFreshHeaders = module.freshHeaders;

  express.get('/documents', canViewLocal, showIndexRoute);
  express.post('/documents', canViewLocal, authClientRoute);
  express.get('/docs/:clientId', canViewLocal, showIndexRoute);
  express.post('/docs/:clientId', canViewLocal, authClientRoute);

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

  express.post('/orderDocuments/tree', canManage, manageTreeRoute);
  express.post(
    '/orderDocuments/uploads',
    canManage,
    multer({
      storage: multer.diskStorage({
        destination: path.join(module.config.uploadedPath, '.tmp')
      }),
      fileFilter: function(req, file, done)
      {
        done(null, file.mimetype === 'application/pdf' && /\.pdf$/i.test(file.originalname));
      }
    }).single('file'),
    function(req, res, next)
    {
      if (req.file)
      {
        res.send(req.file.filename);
      }
      else
      {
        next(app.createError('INVALID_FILE', 400));
      }
    }
  );
  express.get('/orderDocuments/folders', canViewUser, express.crud.browseRoute.bind(null, app, OrderDocumentFolder));
  express.get('/orderDocuments/folders/:id', canViewUser, express.crud.readRoute.bind(null, app, OrderDocumentFolder));
  express.get('/orderDocuments/files', canViewUser, express.crud.browseRoute.bind(null, app, OrderDocumentFile));
  express.get('/orderDocuments/files/:id', canViewUser, express.crud.readRoute.bind(null, app, OrderDocumentFile));
  express.get('/orderDocuments/names', canViewUser, express.crud.browseRoute.bind(null, app, OrderDocumentName));

  express.get('/orders/:orderNo/documents', canViewLocal, function(req, res, next)
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

  express.get('/orders/:orderNo/documentContents', canViewLocal, function(req, res, next)
  {
    const orderNo = req.params.orderNo;

    if (!_.isString(orderNo) || !/^[0-9]+$/.test(orderNo))
    {
      return next(app.createError('INPUT', 400));
    }

    step(
      function()
      {
        module.findOrderData(orderNo, this.next());
      },
      function(err, orderData)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.results = {};

        Object.keys(orderData.documents).forEach(nc15 =>
        {
          const done = this.group();
          const opts = {
            orderNo,
            hash: null,
            forcePdf: false,
            includeName: true
          };

          findDocumentFilePath(nc15, opts, (err, results) => // eslint-disable-line handle-callback-err
          {
            (results && results.meta && results.meta.pages ? results.meta.pages : []).forEach(page =>
            {
              page.content.forEach(text =>
              {
                const item = text.s.padStart(4, '0');

                text.p = page.info.num;

                if (!this.results[item])
                {
                  this.results[item] = {};
                }

                if (!this.results[item][nc15])
                {
                  this.results[item][nc15] = [];
                }

                this.results[item][nc15].push(text);
              });
            });

            done(null);
          });
        });
      },
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        res.json(this.results);
      }
    );
  });

  express.get('/orderDocuments/:nc15/meta', canViewLocal, function(req, res, next)
  {
    const nc15 = req.params.nc15;

    if (SPECIAL_DOCUMENTS[nc15])
    {
      return next(app.createError('NO_SPECIAL_NC15', 400));
    }

    const orderNo = /^[0-9]{9}$/.test(req.query.order) ? req.query.order : null;
    const hash = /^[a-f0-9]{32}$/.test(req.query.hash) ? req.query.hash : null;

    findDocumentFilePath(nc15, {orderNo, hash, forcePdf: false, includeName: true}, function(err, results)
    {
      if (err)
      {
        if (err.code === 'ENOENT')
        {
          return res.sendStatus(404);
        }

        return next(err);
      }

      if (!results)
      {
        return res.sendStatus(404);
      }

      if (!results.meta)
      {
        return next(app.createError('NO_META', 400));
      }

      res.json(results.meta);
    });
  });

  express.head('/orderDocuments/:nc15', canViewLocal, function(req, res, next)
  {
    const nc15 = req.params.nc15;

    if (SPECIAL_DOCUMENTS[nc15])
    {
      return SPECIAL_DOCUMENTS[nc15](req, res, next);
    }

    module.checkRemoteServer(nc15);

    const orderNo = /^[0-9]{9}$/.test(req.query.order) ? req.query.order : null;
    const hash = /^[a-f0-9]{32}$/.test(req.query.hash) ? req.query.hash : null;
    const options = {
      orderNo,
      hash,
      forcePdf: true,
      includeName: !!req.query.name
    };

    findDocumentFilePath(nc15, options, function(err, results)
    {
      if (err || !results)
      {
        return res.sendStatus(404);
      }

      res.set('X-Document-Source', results.source);

      if (!_.isEmpty(results.name))
      {
        res.set('X-Document-Name', transliterate(results.name, {unknown: '?'}));
      }

      return res.sendStatus(204);
    });
  });

  express.get('/orderDocuments/:nc15', canViewLocal, function(req, res, next)
  {
    const nc15 = req.params.nc15;

    if (SPECIAL_DOCUMENTS[nc15])
    {
      return SPECIAL_DOCUMENTS[nc15](req, res, next);
    }

    const orderNo = /^[0-9]{9}$/.test(req.query.order) ? req.query.order : null;
    const freshHeaders = nc15ToFreshHeaders[nc15] && nc15ToFreshHeaders[nc15][orderNo];

    if (freshHeaders && fresh(req.headers, freshHeaders.headers))
    {
      res.set(freshHeaders.headers);
      res.sendStatus(304);

      return;
    }

    const hash = /^[a-f0-9]{32}$/.test(req.query.hash) ? req.query.hash : null;
    const options = {
      orderNo,
      hash,
      forcePdf: !!req.query.pdf,
      includeName: false
    };

    findDocumentFilePath(nc15, options, function(err, results)
    {
      if (err)
      {
        if (err.code === 'ENOENT')
        {
          return res.sendStatus(404);
        }

        if (err.code === 'CONVERTING')
        {
          return res.render('orderDocuments:converting', {error: err.message, nc15, hash});
        }

        return next(err);
      }

      if (!results)
      {
        return res.sendStatus(404);
      }

      if (results.meta)
      {
        return res.render('orderDocuments:viewer', {
          nc15: nc15,
          hash: results.hash,
          meta: results.meta,
          name: results.name
        });
      }

      return res.sendFile(results.filePath, {maxAge: 60 * 1000}, function(err)
      {
        if (err)
        {
          return next(err);
        }

        if (!nc15ToFreshHeaders[nc15])
        {
          nc15ToFreshHeaders[nc15] = {};
        }

        if (nc15ToFreshHeaders[nc15][orderNo])
        {
          clearTimeout(nc15ToFreshHeaders[nc15][orderNo].timer);
        }

        nc15ToFreshHeaders[nc15][orderNo] = {
          headers: _.pick(res._headers, ['etag', 'last-modified', 'cache-control']),
          timer: setTimeout(clearFreshHeader.bind(null, nc15, orderNo), 60 * 1000)
        };
      });
    });
  });

  express.get('/orderDocuments/:nc15/:page', canViewLocal, function(req, res, next)
  {
    const nc15 = req.params.nc15;
    const page = parseInt(req.params.page, 10);
    const hash = /^[a-f0-9]{32}$/.test(req.query.hash) ? req.query.hash : '';
    const freshKey = `${hash}_${page}`;
    const freshHeaders = nc15ToFreshHeaders[nc15] && nc15ToFreshHeaders[nc15][freshKey];

    if (freshHeaders && fresh(req.headers, freshHeaders.headers))
    {
      res.set(freshHeaders);
      res.sendStatus(304);

      return;
    }

    const fileName = `${nc15}_${page}.webp`;
    const filePath = hash
      ? path.join(module.config.uploadedPath, nc15, hash, fileName)
      : path.join(module.config.convertedPath, nc15, fileName);

    res.sendFile(filePath, {maxAge: 60 * 1000}, function(err)
    {
      if (err)
      {
        if (err.code === 'ENOENT')
        {
          return res.sendStatus(404);
        }

        return next(err);
      }

      if (!nc15ToFreshHeaders[nc15])
      {
        nc15ToFreshHeaders[nc15] = {};
      }

      if (nc15ToFreshHeaders[nc15][freshKey])
      {
        clearTimeout(nc15ToFreshHeaders[nc15][freshKey].timer);
      }

      nc15ToFreshHeaders[nc15][freshKey] = {
        headers: _.pick(res._headers, ['etag', 'last-modified', 'cache-control']),
        timer: setTimeout(clearFreshHeader.bind(null, nc15, freshKey), 60 * 1000)
      };
    });
  });

  express.post('/orderDocuments;import', canViewLocal, function(req, res, next)
  {
    res.type('text/plain');

    if (!req.is('text/plain'))
    {
      return res.status(400).send('INVALID_CONTENT_TYPE');
    }

    const timestamp = parseInt(req.query.timestamp, 10);
    const step = parseInt(req.query.step, 10);

    if (isNaN(timestamp) || isNaN(step) || req.body.length < 256)
    {
      return res.status(400).send('INPUT');
    }

    const importFile = module.config.importFile
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

  function clearFreshHeader(nc15, key)
  {
    if (nc15ToFreshHeaders[nc15] && nc15ToFreshHeaders[nc15][key])
    {
      delete nc15ToFreshHeaders[nc15][key];
    }
  }

  function findDocumentFilePath(nc15, options, done)
  {
    if (!/^[0-9]+$/.test(nc15))
    {
      return done(app.createError('INVALID_NC15', 400));
    }

    if (!module.settings.useCatalog && !options.hash)
    {
      return findLegacyDocumentFilePath(nc15, options, done);
    }

    step(
      function()
      {
        OrderDocumentFile.findById(nc15, {name: 1, files: 1}).lean().exec(this.parallel());

        if (options.orderNo)
        {
          Order.findById(options.orderNo, {sapCreatedAt: 1, scheduledStartDate: 1}).lean().exec(this.parallel());
        }
      },
      function(err, orderDocumentFile, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderDocumentFile || _.isEmpty(orderDocumentFile.files))
        {
          return this.skip();
        }

        const orderDate = order ? (order.sapCreatedAt || order.scheduledStartDate) : null;
        const orderTime = orderDate
          ? moment.utc(moment(orderDate).format('YYYY-MM-DD'), 'YYYY-MM-DD').valueOf()
          : moment.utc().startOf('day').valueOf();
        let file = null;

        if (options.hash)
        {
          file = _.find(orderDocumentFile.files, f => f.hash === options.hash);
        }
        else
        {
          file = _.find(orderDocumentFile.files, f => orderTime >= f.date.getTime());
        }

        if (!file)
        {
          return this.skip();
        }

        this.hash = file.hash;
        this.name = orderDocumentFile.name;
        this.filePath = path.join(
          module.config.uploadedPath,
          nc15,
          file.hash,
          options.forcePdf ? `${nc15}.pdf` : 'meta.json'
        );
        this.pdfFilePath = options.forcePdf ? null : path.join(
          module.config.uploadedPath,
          nc15,
          file.hash,
          `${nc15}.pdf`
        );

        fs.stat(this.filePath, this.parallel());

        if (!options.forcePdf)
        {
          fs.readFile(this.filePath, 'utf8', this.parallel());
        }
        else
        {
          setImmediate(this.parallel(), null, null);
        }

        if (this.pdfFilePath)
        {
          fs.stat(this.pdfFilePath, this.parallel());
        }
      },
      function(err, stats, metaJson, pdfStats) // eslint-disable-line handle-callback-err
      {
        const meta = metaJson ? tryJsonParse(metaJson) : null;

        if (meta || (stats && stats.isFile()) || (pdfStats && pdfStats.isFile()))
        {
          return this.done(done, null, {
            filePath: stats ? this.filePath : this.pdfFilePath,
            source: 'remote',
            meta: options.forcePdf ? null : meta,
            name: this.name,
            hash: this.hash
          });
        }

        if (options.forcePdf && options.hash)
        {
          OrderDocumentUpload.findById(options.hash, this.next());
        }
      },
      function(err, upload)
      {
        if (!err && upload)
        {
          handleUploadInProgress(upload, done);
        }
        else
        {
          findLegacyDocumentFilePath(nc15, options, done);
        }
      }
    );
  }

  function handleUploadInProgress(upload, done)
  {
    if (upload.count >= 2)
    {
      upload.count = 0;

      upload.save(err =>
      {
        if (err)
        {
          done(err);
        }
        else
        {
          app.broker.publish('orderDocuments.tree.filesUploaded');

          done(app.createError(`Converting ${upload.nc15}/${upload._id} (again)...`, 'CONVERTING', 400));
        }
      });
    }
    else
    {
      done(app.createError(`Converting ${upload.nc15}/${upload._id}...`, 'CONVERTING', 400));
    }
  }

  function tryJsonParse(json)
  {
    try
    {
      return JSON.parse(json);
    }
    catch (err)
    {
      return null;
    }
  }

  function findLegacyDocumentFilePath(nc15, options, done)
  {
    if (_.isEmpty(module.settings.path))
    {
      return done(app.createError('NO_PATH_SETTING', 503));
    }

    const cachedFilePath = path.join(module.config.cachedPath, nc15 + '.pdf');
    const localFilePath = path.join(module.settings.path, nc15 + '.pdf');
    const convertedPath = path.join(module.config.convertedPath, nc15);

    step(
      function()
      {
        const localDone = this.parallel();
        const cachedDone = this.parallel();
        const convertedDone = this.parallel();

        fs.stat(localFilePath, localDone);

        if (_.isEmpty(module.settings.remoteServer))
        {
          cachedDone();
        }
        else
        {
          fs.stat(cachedFilePath, cachedDone);
        }

        if (options.forcePdf)
        {
          convertedDone();
        }
        else
        {
          fs.readFile(
            path.join(convertedPath, 'meta.json'),
            'utf8',
            (err, json) => convertedDone(null, json ? JSON.parse(json) : null) // eslint-disable-line handle-callback-err
          );
        }

        if (options.includeName)
        {
          OrderDocumentName.findById(nc15).lean().exec(this.parallel());
        }
      },
      function(err, localStats, cachedStats, meta, orderDocumentName)
      {
        const name = orderDocumentName ? orderDocumentName.name : null;

        if (meta)
        {
          return done(null, {
            filePath: convertedPath,
            source: cachedStats ? 'search' : 'remote',
            meta: meta,
            name: name,
            hash: ''
          });
        }

        if (cachedStats)
        {
          return done(null, {
            filePath: cachedFilePath,
            source: 'search',
            meta: null,
            name: name,
            hash: ''
          });
        }

        if (localStats)
        {
          return done(null, {
            filePath: localFilePath,
            source: 'remote',
            meta: null,
            name: name,
            hash: ''
          });
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
    step(
      function()
      {
        Order.findById(req.query.order, {qty: 1, bom: 1}).lean().exec(this.next());
      },
      function(err, order)
      {
        if (err)
        {
          return next(err);
        }

        if (!order)
        {
          return next(app.createError('ORDER_NOT_FOUND', 404));
        }

        if (req.method !== 'HEAD')
        {
          Order.assignPkhdStrategies(order, this.next());
        }
      },
      function(err, order)
      {
        if (err)
        {
          return next(err);
        }

        if (req.method === 'HEAD')
        {
          return res.sendStatus(204);
        }

        res.render('orderDocuments:bom', {
          order: order._id,
          components: _.map(order.bom, function(component)
          {
            let qty = component.qty;

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
      }
    );
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

      // eslint-disable-next-line handle-callback-err
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

  function showIndexRoute(req, res)
  {
    const sessionUser = req.session.user;
    const locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

    res.format({
      'text/html': function()
      {
        res.render('index', {
          appCacheManifest: app.options.env !== 'development' ? '/orderDocuments/manifest.appcache' : '',
          appData: {
            ENV: JSON.stringify(app.options.env),
            VERSIONS: JSON.stringify(updaterModule ? updaterModule.getVersions() : {}),
            TIME: JSON.stringify(Date.now()),
            LOCALE: JSON.stringify(locale),
            FRONTEND_SERVICE: JSON.stringify('docs'),
            CLIENT_ID: JSON.stringify(req.params.clientId || req.query.COMPUTERNAME || null)
          },
          mainJsFile: 'wmes-docs.js',
          mainCssFile: 'assets/wmes-docs.css'
        });
      }
    });
  }

  function authClientRoute(req, res, next)
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

        const prodLine = orgUnits.getByTypeAndId('prodLine', req.body.prodLineId);

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
  }

  function manageTreeRoute(req, res, next)
  {
    const action = req.body.action;

    if (!_.isString(action) || !/^[a-zA-Z0-9]{1,30}$/.test(action))
    {
      return next(app.createError('INVALID_ACTION', 400));
    }

    if (!_.isFunction(module.tree[action]))
    {
      return next(app.createError('UNKNOWN_ACTION', 400));
    }

    const user = userModule.createUserInfo(req.session.user, req);

    module.tree[action](req.body.params, user, function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);
    });
  }
};
