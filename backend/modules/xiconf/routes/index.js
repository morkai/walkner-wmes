// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const multer = require('multer');
const importResultsRoute = require('./importResults');
const importOrdersRoute = require('./importOrders');
const downloadRoute = require('./download');
const syncProgramsRoute = require('./programs/sync');
const deleteProgramRoute = require('./programs/delete');
const goToClientsPageRoute = require('./clients/goToPage');
const downloadClientsVNCRoute = require('./clients/downloadVNC');
const getClientsSettingsRoute = require('./clients/getSettings');
const getClientLicensesRoute = require('./clients/getLicenses');
const addClientLicenseRoute = require('./clients/addLicense');
const sendUpdateRoute = require('./sendUpdate');

module.exports = function setUpXiconfRoutes(app, xiconfModule)
{
  const express = app[xiconfModule.config.expressId];
  const mongoose = app[xiconfModule.config.mongooseId];
  const userModule = app[xiconfModule.config.userId];
  const settings = app[xiconfModule.config.settingsId];
  const sio = app[xiconfModule.config.sioId];
  const Order = mongoose.model('Order');
  const XiconfClient = mongoose.model('XiconfClient');
  const XiconfClientSettings = mongoose.model('XiconfClientSettings');
  const XiconfResult = mongoose.model('XiconfResult');
  const XiconfProgram = mongoose.model('XiconfProgram');
  const XiconfHidLamp = mongoose.model('XiconfHidLamp');
  const XiconfComponentWeight = mongoose.model('XiconfComponentWeight');
  const XiconfOrder = mongoose.model('XiconfOrder');

  const canView = userModule.auth('XICONF:VIEW');
  const canViewLocal = userModule.auth('LOCAL', 'XICONF:VIEW');
  const canManage = userModule.auth('XICONF:MANAGE');
  const canManageLocal = userModule.auth('LOCAL', 'XICONF:MANAGE');
  const remoteRequests = {};

  setInterval(function()
  {
    const now = Date.now();

    _.forEach(remoteRequests, (remoteRequest, k) =>
    {
      if (now - remoteRequest.timestamp >= 60000)
      {
        delete remoteRequests[k];
      }
    });
  }, 60000);

  express.get('/maxos', function(req, res, next)
  {
    settings.findById('maxos.address', (err, setting) =>
    {
      if (err)
      {
        return next(err);
      }

      if (!setting || /^http$/.test(setting.value))
      {
        res.sendStatus(404);
      }
      else
      {
        res.redirect(setting.value);
      }
    });
  });

  //
  // Upload
  //
  express.post(
    '/xiconf;upload',
    canManage,
    multer({
      storage: multer.diskStorage({
        destination: xiconfModule.config.updatesPath,
        filename: (req, file, cb) => cb(null, file.originalname)
      }),
      fileFilter: function(req, file, done)
      {
        done(null, file.mimetype === 'application/x-zip-compressed'
          && /^[0-9]+\.[0-9x]+\.[0-9x]+\-[0-9]+\.[0-9x]+\.[0-9x]+\.zip$/.test(file.originalname));
      }
    }).single('update'),
    function(req, res, next)
    {
      if (req.file)
      {
        res.sendStatus(204);
      }
      else
      {
        next(app.createError('INVALID_FILE', 400));
      }
    }
  );

  //
  // Remote action execute
  //
  express.post('/xiconf;execute', userModule.auth('LOCAL'), function(req, res, next)
  {
    const rid = req.query.rid;
    const action = req.query.action;

    if (_.isEmpty(rid)
      || !_.isString(rid)
      || _.isEmpty(action)
      || !_.isString(action)
      || !_.isFunction(xiconfModule.remote[action]))
    {
      return next(express.createHttpError('BAD_REQUEST', 400));
    }

    let remoteRequest = remoteRequests[rid];

    if (!remoteRequest)
    {
      remoteRequest = remoteRequests[rid] = {
        timestamp: Date.now(),
        rid: rid,
        action: action,
        result: undefined,
        responseSockets: []
      };
    }

    if (remoteRequest.result !== undefined)
    {
      return remoteRequest.result instanceof Error ? next(remoteRequest.result) : res.json(remoteRequest.result);
    }

    remoteRequest.responseSockets.push(res);

    xiconfModule.remote[action](req.body, function(err, result)
    {
      _.forEach(remoteRequest.responseSockets, function(res)
      {
        if (err)
        {
          res.statusCode = err.status || 500;
          res.json({error: err});
        }
        else
        {
          res.json(result);
        }
      });

      remoteRequest.result = err || result;
      remoteRequest.responseSockets = null;
    });
  });

  //
  // Settings
  //
  express.get(
    '/xiconf/settings',
    canView,
    function limitToXiconfSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^xiconf\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/xiconf/settings/:id', canManage, settings.updateRoute);

  //
  // Orders
  //
  express.get('/xiconf/orders', canView, express.crud.browseRoute.bind(null, app, XiconfOrder));

  express.get('/xiconf/orders;export.:format?', canView, express.crud.exportRoute.bind(null, app, {
    filename: 'WMES-XICONF-ORDERS',
    serializeRow: exportXiconfOrder,
    model: XiconfOrder,
    freezeRows: 1,
    freezeColumns: 1,
    columns: {
      orderNo: 9,
      nc12: 12,
      name: 30,
      quantityTodo: 'integer',
      quantityDone: 'integer',
      status: {type: 'integer', width: 5},
      startDate: 'date',
      finishDate: 'date',
      reqDate: 'date',
      startedAt: 'datetime',
      finishedAt: 'datetime',
      duration: 'integer'
    }
  }));

  express.post('/xiconf/orders;import', importOrdersRoute.bind(null, app, xiconfModule));

  express.get(
    '/xiconf/orders/:id',
    canView,
    express.crud.readRoute.bind(null, app, {
      model: XiconfOrder,
      prepareResult: prepareXiconfOrder
    })
  );

  //
  // Results
  //
  express.post('/xiconf;import', importResultsRoute.bind(null, app, xiconfModule));

  express.get(
    '/xiconf/results',
    canView,
    populateOrder.bind(null, ['no', 'quantity']),
    express.crud.browseRoute.bind(null, app, {
      model: XiconfResult,
      prepareResult: findDistinctSrcIds
    })
  );

  express.get(
    '/xiconf/results;export.:format?',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {
        srcId: 1,
        srcTitle: 1,
        srcIp: 1,
        srcUuid: 1,
        orderNo: 1,
        nc12: 1,
        gprsNc12: 1,
        programName: 1,
        counter: 1,
        result: 1,
        errorCode: 1,
        exception: 1,
        startedAt: 1,
        finishedAt: 1,
        featurePath: 1,
        workflowPath: 1,
        prodLine: 1,
        serviceTag: 1,
        'leds.name': 1,
        'hidLamps.name': 1
      };
      req.rql.sort = {};

      next();
    },
    // populateOrder.bind(null, []),
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-XICONF-RESULTS',
      serializeRow: exportXiconfResult,
      model: XiconfResult
    })
  );

  express.get(
    '/xiconf/results/:id;workflow',
    canView,
    downloadRoute.bind(null, 'workflow', app, xiconfModule, XiconfResult)
  );

  express.get(
    '/xiconf/results/:id;feature',
    canView,
    downloadRoute.bind(null, 'feature', app, xiconfModule, XiconfResult)
  );

  express.get(
    '/xiconf/results/:id;gprsOrder',
    canView,
    downloadRoute.bind(null, 'gprsOrder', app, xiconfModule, XiconfResult)
  );

  express.get(
    '/xiconf/results/:id;gprsInput',
    canView,
    downloadRoute.bind(null, 'gprsInput', app, xiconfModule, XiconfResult)
  );

  express.get(
    '/xiconf/results/:id;gprsOutput',
    canView,
    downloadRoute.bind(null, 'gprsOutput', app, xiconfModule, XiconfResult)
  );

  express.get(
    '/xiconf/results/:id',
    canView,
    populateOrder.bind(null, []),
    express.crud.readRoute.bind(null, app, {
      model: XiconfResult,
      prepareResult: prepareXiconfResult
    })
  );

  //
  // Programs
  //
  express.get(
    '/xiconf/programs',
    canView,
    function(req, res, next)
    {
      req.rql.selector.args.push({name: 'eq', args: ['deleted', false]});

      next();
    },
    express.crud.browseRoute.bind(null, app, XiconfProgram)
  );

  express.post(
    '/xiconf/programs',
    canManage,
    prepareNewProgram,
    express.crud.addRoute.bind(null, app, XiconfProgram)
  );

  express.post('/xiconf/programs;sync', syncProgramsRoute.bind(null, app, xiconfModule));

  express.get('/xiconf/programs/:id', canView, express.crud.readRoute.bind(null, app, XiconfProgram));

  express.put(
    '/xiconf/programs/:id',
    canManage,
    prepareExistingProgram,
    express.crud.editRoute.bind(null, app, XiconfProgram)
  );

  express.delete('/xiconf/programs/:id', canManage, deleteProgramRoute.bind(null, app, XiconfProgram));

  //
  // HID Lamps
  //
  express.get('/xiconf/hidLamps', canView, express.crud.browseRoute.bind(null, app, XiconfHidLamp));
  express.post('/xiconf/hidLamps', canManage, express.crud.addRoute.bind(null, app, XiconfHidLamp));
  express.get('/xiconf/hidLamps/:id', canView, express.crud.readRoute.bind(null, app, XiconfHidLamp));
  express.put('/xiconf/hidLamps/:id', canManage, express.crud.editRoute.bind(null, app, XiconfHidLamp));
  express.delete('/xiconf/hidLamps/:id', canManage, express.crud.deleteRoute.bind(null, app, XiconfHidLamp));

  //
  // Component Weights
  //
  express.get('/xiconf/componentWeights', canView, express.crud.browseRoute.bind(null, app, XiconfComponentWeight));
  express.post('/xiconf/componentWeights', canManage, express.crud.addRoute.bind(null, app, XiconfComponentWeight));
  express.get('/xiconf/componentWeights/:id', canView, express.crud.readRoute.bind(null, app, XiconfComponentWeight));
  express.put(
    '/xiconf/componentWeights/:id', canManage, express.crud.editRoute.bind(null, app, XiconfComponentWeight)
  );
  express.delete(
    '/xiconf/componentWeights/:id', canManage, express.crud.deleteRoute.bind(null, app, XiconfComponentWeight)
  );

  //
  // Clients
  //
  express.get(
    '/xiconf/clients',
    canViewLocal,
    crossOrigin,
    express.crud.browseRoute.bind(null, app, {
      model: XiconfClient,
      prepareResult: prepareXiconfClient
    })
  );
  express.get('/xiconf/clients;debug', canManage, getClientsDebugInfoRoute);
  express.get('/xiconf/clients;clear', canManage, clearOrderDataRoute);
  express.get('/xiconf/clients;update', canManage, updateRemoteDataRoute);
  express.get(
    '/xiconf/clients;settings',
    canManageLocal,
    crossOrigin,
    express.crud.browseRoute.bind(null, app, XiconfClientSettings)
  );
  express.post(
    '/xiconf/clients;settings',
    canManageLocal,
    getClientsSettingsRoute.bind(null, app, xiconfModule)
  );
  express.options('/xiconf/clients;licenses', crossOrigin, (req, res) => res.sendStatus(204));
  express.get(
    '/xiconf/clients;licenses',
    canViewLocal,
    crossOrigin,
    getClientLicensesRoute.bind(null, app, xiconfModule)
  );
  express.post(
    '/xiconf/clients;licenses',
    canManageLocal,
    crossOrigin,
    addClientLicenseRoute.bind(null, app, xiconfModule)
  );

  express.get('/xiconf/clients/:id;goTo', canView, goToClientsPageRoute.bind(null, app, xiconfModule));

  express.get('/xiconf/clients/:id;downloadVNC', canView, downloadClientsVNCRoute.bind(null, app, xiconfModule));

  express.delete('/xiconf/clients/:id', canManage, express.crud.deleteRoute.bind(null, app, XiconfClient));

  express.get('/xiconf/updates/:version', sendUpdateRoute.bind(null, app, xiconfModule));

  function crossOrigin(req, res, next)
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    next();
  }

  function getClientsDebugInfoRoute(req, res)
  {
    if (_.isFunction(xiconfModule.getRemoteCoordinatorDebugInfo))
    {
      res.json(xiconfModule.getRemoteCoordinatorDebugInfo(req.query.enable !== undefined));
    }
    else
    {
      res.sendStatus(500);
    }
  }

  function clearOrderDataRoute(req, res)
  {
    if (_.isFunction(xiconfModule.clearOrderData))
    {
      xiconfModule.clearOrderData(req.query.order);

      res.json(xiconfModule.getRemoteCoordinatorDebugInfo().ordersToDataMap);
    }
    else
    {
      res.sendStatus(500);
    }
  }

  function updateRemoteDataRoute(req, res)
  {
    if (_.isEmpty(req.query.prodLine))
    {
      res.sendStatus(400);
    }
    else if (_.isFunction(xiconfModule.updateRemoteData))
    {
      xiconfModule.updateRemoteData(req.query.prodLine);

      res.json(xiconfModule.getRemoteCoordinatorDebugInfo().prodLinesToDataMap[req.query.prodLine] || null);
    }
    else
    {
      res.sendStatus(500);
    }
  }

  function populateOrder(fields, req, res, next)
  {
    req.rql.selector.args.push(
      {name: 'populate', args: ['order', fields]}
    );

    next();
  }

  function exportXiconfResult(doc)
  {
    let leds = '';
    let hidLamps = '';

    if (!_.isEmpty(doc.leds))
    {
      const ledMap = {};

      _.forEach(doc.leds, led => ledMap[led.name] = 1);

      leds = Object.keys(ledMap).join(', ');
    }
    else if (!_.isEmpty(doc.hidLamps))
    {
      const hidLampMap = {};

      _.forEach(doc.hidLamps, hidLamp => hidLampMap[hidLamp.name] = 1);

      hidLamps = Object.keys(hidLampMap).join(', ');
    }

    return {
      '"srcId': doc.srcId,
      '"srcTitle': doc.srcTitle,
      '"prodLine': doc.prodLine,
      '"serviceTag': doc.serviceTag,
      '"orderNo': doc.orderNo,
      '"12nc': doc.nc12,
      '"gprs12nc': doc.gprsNc12,
      '"programName': doc.programName,
      '"leds': leds,
      '"hidLamps': hidLamps,
      '#counter': doc.counter,
      '"result': doc.result,
      '"errorCode': doc.errorCode,
      '"exception': doc.exception,
      'startedAt': app.formatDateTime(doc.startedAt),
      'finishedAt': app.formatDateTime(doc.finishedAt),
      '#duration': (doc.finishedAt - doc.startedAt) / 1000,
      '"featurePath': doc.featurePath,
      '"workflowPath': doc.workflowPath,
      '"srcIp': doc.srcIp,
      '"srcUuid': doc.srcUuid
    };
  }

  function exportXiconfOrder(doc)
  {
    return {
      orderNo: doc._id,
      nc12: doc.nc12[0],
      name: doc.name,
      quantityTodo: doc.quantityTodo,
      quantityDone: doc.quantityDone,
      status: doc.status,
      startDate: doc.startDate,
      finishDate: doc.finishDate,
      reqDate: doc.reqDate,
      startedAt: doc.startedAt,
      finishedAt: doc.finishedAt,
      duration: doc.finishedAt ? ((doc.finishedAt - doc.startedAt) / 1000) : 0
    };
  }

  function prepareXiconfResult(xiconfResult, done)
  {
    if (xiconfResult.toJSON)
    {
      xiconfResult = xiconfResult.toJSON();
    }

    step(
      function()
      {
        readFileContents(xiconfResult, 'feature', xiconfResult.featureHash, this.group());
        readFileContents(xiconfResult, 'gprsOrderFile', xiconfResult.gprsOrderFileHash, this.group());
        readFileContents(xiconfResult, 'gprsInputFile', xiconfResult.gprsInputFileHash, this.group());
        readFileContents(xiconfResult, 'gprsOutputFile', xiconfResult.gprsOutputFileHash, this.group());
      },
      function(err)
      {
        return done(err, xiconfResult);
      }
    );
  }

  function readFileContents(xiconfResult, property, fileHash, done)
  {
    if (!fileHash)
    {
      return done();
    }

    const filePath = path.join(xiconfModule.config.featureDbPath, fileHash + '.xml');

    fs.readFile(filePath, 'utf8', function(err, contents)
    {
      if (err && err.code !== 'ENOENT')
      {
        return done(err);
      }

      xiconfResult[property] = contents || null;

      return done();
    });
  }

  function findDistinctSrcIds(totalCount, models, done)
  {
    const result = {
      totalCount: totalCount,
      collection: models,
      srcIds: null
    };

    XiconfResult.distinct('srcId', function(err, srcIds)
    {
      if (err)
      {
        return done(err);
      }

      result.srcIds = srcIds;

      return done(null, result);
    });
  }

  function prepareNewProgram(req, res, next)
  {
    req.body = _.pick(req.body, ['type', 'name', 'steps', 'prodLines']);
    req.body.deleted = false;
    req.body.createdAt = new Date();
    req.body.updatedAt = req.body.createdAt;
    req.body._id = req.body.createdAt.getTime().toString(36).toUpperCase()
      + Math.round(1000 + Math.random() * 8999).toString(36).toUpperCase();

    next();
  }

  function prepareExistingProgram(req, res, next)
  {
    req.body = _.pick(req.body, ['type', 'name', 'steps', 'prodLines']);
    req.body.updatedAt = new Date();

    next();
  }

  function prepareXiconfOrder(xiconfOrder, done)
  {
    if (xiconfOrder.toJSON)
    {
      xiconfOrder = xiconfOrder.toJSON();
    }

    step(
      function findRelatedOrders()
      {
        Order.findById(xiconfOrder._id, {changes: 0, operations: 0}).lean().exec(this.parallel());
      },
      function sendResultsStep(err, parentOrder)
      {
        if (err)
        {
          return done(err);
        }

        xiconfOrder.parentOrder = parentOrder;

        return done(null, xiconfOrder);
      }
    );
  }

  function prepareXiconfClient(totalCount, clients, formatResult)
  {
    if (Array.isArray(clients))
    {
      clients.forEach(client =>
      {
        const socket = sio.sockets.connected[client.socket];

        client.remoteAddress = socket ? socket.conn.remoteAddress : null;
      });
    }

    formatResult(null, {
      totalCount: totalCount,
      collection: clients
    });
  }
};
