// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var step = require('h5.step');
var importResultsRoute = require('./importResults');
var importOrdersRoute = require('./importOrders');
var downloadRoute = require('./download');
var syncProgramsRoute = require('./programs/sync');
var deleteProgramRoute = require('./programs/delete');
var goToClientsPageRoute = require('./clients/goToPage');
var downloadClientsVNCRoute = require('./clients/downloadVNC');
var sendUpdateRoute = require('./sendUpdate');

module.exports = function setUpXiconfRoutes(app, xiconfModule)
{
  var express = app[xiconfModule.config.expressId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var userModule = app[xiconfModule.config.userId];
  var settings = app[xiconfModule.config.settingsId];
  var Order = mongoose.model('Order');
  var XiconfClient = mongoose.model('XiconfClient');
  var XiconfResult = mongoose.model('XiconfResult');
  var XiconfProgram = mongoose.model('XiconfProgram');
  var XiconfOrder = mongoose.model('XiconfOrder');

  var canView = userModule.auth('XICONF:VIEW');
  var canManage = userModule.auth('XICONF:MANAGE');
  var remoteRequests = {};

  express.post('/xiconf;execute', userModule.auth('LOCAL'), function(req, res, next)
  {
    var rid = req.query.rid;
    var action = req.query.action;

    if (_.isEmpty(rid)
      || !_.isString(rid)
      || _.isEmpty(action)
      || !_.isString(action)
      || !_.isFunction(xiconfModule.remote[action]))
    {
      return next(express.createHttpError('BAD_REQUEST', 400));
    }

    var remoteRequest = remoteRequests[rid];

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

  express.post('/xiconf;import', importResultsRoute.bind(null, app, xiconfModule));

  express.get('/xiconf/orders', canView, express.crud.browseRoute.bind(null, app, XiconfOrder));

  express.get('/xiconf/orders;export', canView, express.crud.exportRoute.bind(null, {
    filename: 'WMES-XICONF-ORDERS',
    serializeRow: exportXiconfOrder,
    model: XiconfOrder
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
    '/xiconf/results;export',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {log: 0};
      req.rql.sort = {};

      next();
    },
    populateOrder.bind(null, []),
    express.crud.exportRoute.bind(null, {
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

  express.get('/xiconf/clients', canView, express.crud.browseRoute.bind(null, app, XiconfClient));

  express.get('/xiconf/clients;debug', canManage, getClientsDebugInfoRoute);
  express.get('/xiconf/clients;clear', canManage, clearOrderDataRoute);

  express.get('/xiconf/clients/:id;goTo', canView, goToClientsPageRoute.bind(null, app, xiconfModule));

  express.get('/xiconf/clients/:id;downloadVNC', canView, downloadClientsVNCRoute.bind(null, app, xiconfModule));

  express.delete('/xiconf/clients/:id', canManage, express.crud.deleteRoute.bind(null, app, XiconfClient));

  express.get('/xiconf/updates/:version', sendUpdateRoute.bind(null, app, xiconfModule));

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

  function populateOrder(fields, req, res, next)
  {
    req.rql.selector.args.push(
      {name: 'populate', args: ['order', fields]}
    );

    next();
  }

  function exportXiconfResult(doc)
  {
    return {
      '"srcId': doc.srcId,
      '"srcTitle': doc.srcTitle,
      '"orderNo': doc.orderNo,
      '"12nc': doc.nc12,
      '"gprs12nc': doc.gprsNc12,
      '"programName': doc.programName,
      '#counter': doc.counter,
      '#quantity': doc.order ? doc.order.quantity : null,
      '"result': doc.result,
      '"errorCode': doc.errorCode,
      '"exception': doc.exception,
      'startedAt': app.formatDateTime(doc.startedAt),
      'finishedAt': app.formatDateTime(doc.finishedAt),
      '#duration': (doc.finishedAt - doc.startedAt) / 1000,
      'orderStartedAt': doc.order ? app.formatDateTime(doc.order.startedAt) : null,
      'orderFinishedAt': doc.order ? app.formatDateTime(doc.order.finishedAt) : null,
      '#orderDuration': doc.order ? ((doc.order.finishedAt - doc.order.startedAt) / 1000) : null,
      '#successCounter': doc.order ? doc.order.successCounter : null,
      '#failureCounter': doc.order ? doc.order.failureCounter : null,
      '"featurePath': doc.featurePath,
      '"workflowPath': doc.workflowPath,
      '"srcIp': doc.srcIp,
      '"srcUuid': doc.srcUuid
    };
  }

  function exportXiconfOrder(doc)
  {
    return {
      '"orderNo': doc._id,
      '"12nc': doc.nc12[0],
      '"name': doc.name,
      '#quantityTodo': doc.quantityTodo,
      '#quantityDone': doc.quantityDone,
      '"status': doc.status,
      'startDate': app.formatDate(doc.startDate),
      'finishDate': app.formatDate(doc.finishDate),
      'reqDate': app.formatDate(doc.reqDate),
      'startedAt': app.formatDateTime(doc.startedAt),
      'finishedAt': app.formatDateTime(doc.finishedAt),
      '#duration': doc.finishedAt ? ((doc.finishedAt - doc.startedAt) / 1000) : 0
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

    var filePath = path.join(xiconfModule.config.featureDbPath, fileHash + '.xml');

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
    var result = {
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
};
