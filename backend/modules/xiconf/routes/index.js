// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var importRoute = require('./import');
var downloadRoute = require('./download');
var syncProgramsRoute = require('./syncPrograms');

module.exports = function setUpXiconfRoutes(app, xiconfModule)
{
  var express = app[xiconfModule.config.expressId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var userModule = app[xiconfModule.config.userId];
  var XiconfResult = mongoose.model('XiconfResult');
  var XiconfProgram = mongoose.model('XiconfProgram');

  var canView = userModule.auth('XICONF:VIEW');
  var canManage = userModule.auth('XICONF:MANAGE');

  express.post('/xiconf;import', importRoute.bind(null, app, xiconfModule));

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

      next();
    },
    populateOrder.bind(null, []),
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-XICONF',
      serializeRow: exportXiconfResult,
      model: XiconfResult
    })
  );

  express.get(
    '/xiconf/results/:id;workflow',
    canView,
    downloadRoute.bind(null, 'workflow', xiconfModule, XiconfResult)
  );

  express.get(
    '/xiconf/results/:id;feature',
    canView,
    downloadRoute.bind(null, 'feature', xiconfModule, XiconfResult)
  );

  express.get(
    '/xiconf/results/:id',
    canView,
    populateOrder.bind(null, []),
    express.crud.readRoute.bind(null, app, {
      model: XiconfResult,
      prepareResult: readFeatureFile
    })
  );

  express.get(
    '/xiconfPrograms',
    canView,
    function(req, res, next)
    {
      req.rql.selector.args.push({name: 'eq', args: ['deleted', false]});

      next();
    },
    express.crud.browseRoute.bind(null, app, XiconfProgram)
  );

  express.post(
    '/xiconfPrograms',
    canManage,
    prepareNewProgram,
    express.crud.addRoute.bind(null, app, XiconfProgram)
  );

  express.post('/xiconfPrograms;sync', syncProgramsRoute.bind(null, app, xiconfModule));

  express.get('/xiconfPrograms/:id', canView, express.crud.readRoute.bind(null, app, XiconfProgram));

  express.put(
    '/xiconfPrograms/:id',
    canManage,
    prepareExistingProgram,
    express.crud.editRoute.bind(null, app, XiconfProgram)
  );

  express.delete('/xiconfPrograms/:id', canManage, deleteProgramRoute);

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
      '"programName': doc.programName,
      '#counter': doc.counter,
      '#quantity': doc.order ? doc.order.quantity : null,
      '"result': doc.result,
      '"errorCode': doc.errorCode,
      '"exception': doc.exception,
      'startedAt': formatTime(doc.startedAt),
      'finishedAt': formatTime(doc.finishedAt),
      '#duration': (doc.finishedAt - doc.startedAt) / 1000,
      'orderStartedAt': doc.order ? formatTime(doc.order.startedAt) : null,
      'orderFinishedAt': doc.order ? formatTime(doc.order.finishedAt) : null,
      '#orderDuration': doc.order ? ((doc.order.finishedAt - doc.order.startedAt) / 1000) : null,
      '#successCounter': doc.order ? doc.order.successCounter : null,
      '#failureCounter': doc.order ? doc.order.failureCounter : null,
      '"featurePath': doc.featurePath,
      '"workflowPath': doc.workflowPath,
      '"srcIp': doc.srcIp,
      '"srcUuid': doc.srcUuid
    };
  }

  function formatTime(date)
  {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  function readFeatureFile(xiconfResult, done)
  {
    if (xiconfResult.featureHash === null)
    {
      return done(null, xiconfResult);
    }

    var featurePath = path.join(
      xiconfModule.config.featureDbPath, xiconfResult.featureHash + '.xml'
    );

    fs.readFile(featurePath, 'utf8', function(err, contents)
    {
      if (err && err.code !== 'ENOENT')
      {
        return done(err);
      }

      var result = xiconfResult.toJSON();

      result.feature = contents || null;

      return done(null, result);
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
    req.body = _.pick(req.body, ['type', 'name', 'steps']);
    req.body.deleted = false;
    req.body.createdAt = new Date();
    req.body.updatedAt = req.body.createdAt;
    req.body._id = req.body.createdAt.toString(36).toUpperCase()
      + Math.round(1000 + Math.random() * 8999).toString(36).toUpperCase();

    next();
  }

  function prepareExistingProgram(req, res, next)
  {
    req.body = _.pick(req.body, ['type', 'name', 'steps']);
    req.body.updatedAt = new Date();

    next();
  }

  function deleteProgramRoute(req, res, next)
  {
    XiconfProgram.findById(req.params.id).exec(function(err, program)
    {
      if (err)
      {
        return next(err);
      }

      program.deleted = true;
      program.updatedAt = new Date();

      program.save(function(err)
      {
        if (err)
        {
          return next(err);
        }

        res.send(204);

        app.broker.publish(XiconfProgram.TOPIC_PREFIX + '.deleted', {
          model: program,
          user: req.session.user
        });
      });
    });
  }
};
