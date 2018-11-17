// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const step = require('h5.step');
const importRoute = require('./import');
const downloadRoute = require('./download');

module.exports = function setUpIcpoRoutes(app, icpoModule)
{
  const express = app[icpoModule.config.expressId];
  const mongoose = app[icpoModule.config.mongooseId];
  const userModule = app[icpoModule.config.userId];
  const IcpoResult = mongoose.model('IcpoResult');

  const canView = userModule.auth('ICPO:VIEW');

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
    '/icpo/results;export.:format?',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {log: 0};
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-ICPO',
      freezeRows: 1,
      columns: {
        srcId: 20,
        srcTitle: 20,
        serviceTag: 15,
        driver: 15,
        gprs: 15,
        led: 15,
        result: 10,
        errorCode: 25,
        exception: 30,
        startedAt: 'datetime',
        finishedAt: 'datetime',
        duration: 'decimal'
      },
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
      srcId: doc.srcId,
      srcTitle: doc.srcTitle,
      serviceTag: doc.serviceTag,
      driver: doc.driver,
      gprs: doc.gprs,
      led: doc.led,
      result: doc.result,
      errorCode: doc.errorCode,
      exception: doc.exception,
      startedAt: doc.startedAt,
      finishedAt: doc.finishedAt,
      duration: (doc.finishedAt - doc.startedAt) / 1000,
      srcIp: doc.srcIp,
      srcUuid: doc.srcUuid
    };
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
        const fileStoragePath = icpoModule.config.fileStoragePath;

        fs.readFile(path.join(fileStoragePath, icpoResult.orderFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.driverFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.gprsFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.inputFileHash || ''), 'utf8', this.parallel());
        fs.readFile(path.join(fileStoragePath, icpoResult.outputFileHash || ''), 'utf8', this.parallel());
      },
      function(err, orderData, driverData, gprsData, inputData, outputData) // eslint-disable-line handle-callback-err
      {
        if (icpoResult.toJSON)
        {
          icpoResult = icpoResult.toJSON();
        }

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
    const result = {
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
