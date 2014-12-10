// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var step = require('h5.step');
var importRoute = require('./import');
var downloadRoute = require('./download');

module.exports = function setUpIcpoRoutes(app, icpoModule)
{
  var express = app[icpoModule.config.expressId];
  var mongoose = app[icpoModule.config.mongooseId];
  var userModule = app[icpoModule.config.userId];
  var IcpoResult = mongoose.model('IcpoResult');

  var canView = userModule.auth('ICPO:VIEW');

  express.post('/icpo;import', importRoute.bind(null, app, icpoModule));

  express.get(
    '/icpo/results',
    canView,
    express.crud.browseRoute.bind(null, app, {
      model: IcpoResult,
      prepareResult: findDistinctSrcIds
    })
  );

  express.get(
    '/icpo/results;export',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {log: 0};

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-ICPO',
      serializeRow: exportIcpoResult,
      model: IcpoResult
    })
  );

  express.get(
    '/icpo/results/:id;orderData',
    canView,
    downloadRoute.bind(null, 'order', icpoModule, IcpoResult)
  );

  express.get(
    '/icpo/results/:id;driverData',
    canView,
    downloadRoute.bind(null, 'driver', icpoModule, IcpoResult)
  );

  express.get(
    '/icpo/results/:id;gprsData',
    canView,
    downloadRoute.bind(null, 'gprs', icpoModule, IcpoResult)
  );

  express.get(
    '/icpo/results/:id;inputData',
    canView,
    downloadRoute.bind(null, 'input', icpoModule, IcpoResult)
  );

  express.get(
    '/icpo/results/:id;outputData',
    canView,
    downloadRoute.bind(null, 'output', icpoModule, IcpoResult)
  );

  express.get(
    '/icpo/results/:id',
    canView,
    express.crud.readRoute.bind(null, app, {
      model: IcpoResult,
      prepareResult: readFiles
    })
  );

  function exportIcpoResult(doc)
  {
    return {
      '"srcId': doc.srcId,
      '"srcTitle': doc.srcTitle,
      '"serviceTag': doc.serviceTag,
      '"driver': doc.driver,
      '"gprs': doc.gprs,
      '"led': doc.led,
      '"result': doc.result,
      '"errorCode': doc.errorCode,
      '"exception': doc.exception,
      'startedAt': formatTime(doc.startedAt),
      'finishedAt': formatTime(doc.finishedAt),
      '#duration': (doc.finishedAt - doc.startedAt) / 1000,
      '"srcIp': doc.srcIp,
      '"srcUuid': doc.srcUuid
    };
  }

  function formatTime(date)
  {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  function readFiles(icpoResult, done)
  {
    if (icpoResult.featureHash === null)
    {
      return done(null, icpoResult);
    }

    step(
      function()
      {
        var fileStoragePath = icpoModule.config.fileStoragePath;

        fs.readFile(path.join(fileStoragePath, icpoResult.orderFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.driverFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.gprsFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.inputFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.outputFileHash || ''), 'utf8', this.parallel());
      },
      function(err, orderData, driverData, gprsData, inputData, outputData)
      {
        icpoResult = icpoResult.toJSON();
        icpoResult.orderData = orderData || null;
        icpoResult.driverData = driverData || null;
        icpoResult.gprsData = gprsData || null;
        icpoResult.inputData = inputData || null;
        icpoResult.outputData = outputData || null;

        return done(null, icpoResult);
      }
    );
  }

  function findDistinctSrcIds(totalCount, models, done)
  {
    var result = {
      totalCount: totalCount,
      collection: models,
      srcIds: null
    };

    IcpoResult.distinct('srcId', function(err, srcIds)
    {
      if (err)
      {
        return done(err);
      }

      result.srcIds = srcIds;

      return done(null, result);
    });
  }
};
