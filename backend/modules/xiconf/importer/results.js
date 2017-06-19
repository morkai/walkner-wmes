// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var _ = require('lodash');
var step = require('h5.step');
var JSZip = require('jszip');
var fs = require('fs-extra');

module.exports = function setUpXiconfResultsImporter(app, xiconfModule)
{
  var licensesModule = app[xiconfModule.config.licensesId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var XiconfOrderResult = mongoose.model('XiconfOrderResult');
  var XiconfResult = mongoose.model('XiconfResult');

  var RESULTS_BATCH_SIZE = 1000;
  var FILTER_RE = /^(.*?)@[a-z0-9]{32}\.zip$/;

  var importing = false;
  var filePathCache = {};
  var fileQueue = [];
  var validEncryptedUuids = {};
  var restarting = false;

  app.broker.subscribe('updater.restarting', function()
  {
    restarting = true;
  });

  app.broker.subscribe('directoryWatcher.changed', enqueueFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (fileInfo.moduleId !== xiconfModule.config.directoryWatcherId || filePathCache[fileInfo.fileName])
    {
      return false;
    }

    var matches = fileInfo.fileName.match(FILTER_RE);

    if (matches === null)
    {
      return false;
    }

    fileInfo.srcIp = matches[1];

    return true;
  }

  function enqueueFile(fileInfo)
  {
    filePathCache[fileInfo.fileName] = true;

    fileQueue.push(fileInfo);

    xiconfModule.debug("Queued %s...", fileInfo.fileName);

    importNextFile();
  }

  function importNextFile()
  {
    if (importing || restarting)
    {
      return;
    }

    var fileInfo = fileQueue.shift();

    if (fileInfo)
    {
      importFile(fileInfo);
    }
  }

  function importFile(fileInfo)
  {
    xiconfModule.debug("Importing %s...", fileInfo.fileName);

    step(
      function()
      {
        importing = true;

        this.fileInfo = fileInfo;
      },
      readArchiveFileStep,
      validateLicenseStep,
      parseModelsStep,
      updateModelsStep,
      saveFeatureFilesStep,
      function(err)
      {
        if (err)
        {
          xiconfModule.error("Failed to import file [%s]: %s", fileInfo.fileName, err.message);
        }
        else
        {
          xiconfModule.info(
            "Imported file [%s] from [%s] (UUID=%s)!",
            fileInfo.fileName,
            this.meta.id,
            this.meta.uuid
          );

          app.broker.publish('xiconf.results.synced', {
            orders: this.orderIds || []
          });
        }

        this.fileInfo = null;
        this.metaFile = null;
        this.ordersFile = null;
        this.resultsFile = null;
        this.featureFiles = null;
        this.meta = null;
        this.orders = null;
        this.results = null;
        this.orderIds = null;

        importing = false;

        delete filePathCache[fileInfo.fileName];

        setImmediate(importNextFile);
        setImmediate(cleanup.bind(null, !!err, fileInfo.filePath));
      }
    );
  }

  async function readArchiveFileStep()
  {
    /*jshint validthis:true*/

    xiconfModule.debug("Reading the archive...");

    const buf = fs.readFile(this.fileInfo.filePath);
    const zip = await new JSZip().loadAsync(buf);

    this.meta = JSON.parse(await zip.file('meta.json').async('string'));
    this.orders = JSON.parse(await zip.file('orders.json').async('string'));
    this.results = JSON.parse(await zip.file('results.json').async('string'));
    this.featureFiles = zip.file(/^features\//);
  }

  function validateLicenseStep(err)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    xiconfModule.debug("Validating the meta file...");

    if (!_.isPlainObject(this.meta))
    {
      return this.skip(new Error('INVALID_META_FILE'));
    }

    const encryptedUuid = this.meta.uuid;

    if (validEncryptedUuids[encryptedUuid])
    {
      this.meta.uuid = validEncryptedUuids[encryptedUuid];

      return;
    }

    try
    {
      this.meta.uuid = licensesModule.licenseEdKey.decrypt(encryptedUuid, 'base64', 'utf8');
    }
    catch (err)
    {
      xiconfModule.debug("Failed to decrypt the UUID: %s", err.message);

      return this.skip(new Error('INVALID_ENCRYPTED_UUID'));
    }

    validEncryptedUuids[encryptedUuid] = this.meta.uuid;
  }

  function parseModelsStep()
  {
    /*jshint validthis:true*/

    xiconfModule.debug("Parsing the models...");

    this.orders = Array.isArray(this.orders)
      ? this.orders.map(prepareOrder.bind(null, this.fileInfo, this.meta))
      : [];

    const orderIdToNo = {};

    _.forEach(this.orders, function(order)
    {
      orderIdToNo[order._id] = order.no;
    });

    this.orderIds = Object.keys(orderIdToNo);

    this.results = Array.isArray(this.results)
      ? this.results.map(prepareResult.bind(null, this.fileInfo, this.meta, orderIdToNo))
      : [];
  }

  function updateModelsStep()
  {
    /*jshint validthis:true*/

    if (!this.orders.length && !this.results.length)
    {
      return this.skip(new Error('NO_ORDERS_AND_RESULTS'));
    }

    xiconfModule.debug("Updating the models (%d orders, %d results)...", this.orders.length, this.results.length);

    var i;
    var l;

    for (i = 0, l = this.orders.length; i < l; ++i)
    {
      XiconfOrderResult.collection.update(
        {_id: this.orders[i]._id}, this.orders[i], {upsert: true}, this.group()
      );
    }

    for (i = 0, l = Math.ceil(this.results.length / RESULTS_BATCH_SIZE); i < l; ++i)
    {
      XiconfResult.collection.insert(
        this.results.slice(i * RESULTS_BATCH_SIZE, i * RESULTS_BATCH_SIZE + RESULTS_BATCH_SIZE),
        {ordered: false},
        this.group()
      );
    }
  }

  function prepareOrder(fileInfo, meta, order)
  {
    return {
      _id: order._id,
      no: order.no,
      quantity: order.quantity,
      successCounter: order.successCounter,
      failureCounter: order.failureCounter,
      startedAt: new Date(order.startedAt),
      finishedAt: new Date(order.finishedAt),
      duration: order.duration,
      srcIp: fileInfo.srcIp,
      srcId: meta.id,
      srcTitle: meta.title,
      srcUuid: meta.uuid
    };
  }

  function prepareResult(fileInfo, meta, orderIdToNo, result)
  {
    var program = tryJsonParse(result.program);

    return {
      _id: result._id,
      order: result._order || null,
      orderNo: orderIdToNo[result._order] || null,
      nc12: result.nc12,
      counter: result.counter,
      startedAt: new Date(result.startedAt),
      finishedAt: new Date(result.finishedAt),
      duration: result.duration,
      log: tryJsonParse(result.log),
      result: result.result,
      errorCode: result.errorCode ? result.errorCode : null,
      exception: result.exception,
      output: result.output,
      programName: program ? program.name : extractProgramName(result.featureFileName, result.nc12),
      featurePath: result.featureFile,
      featureName: result.featureFileName,
      featureHash: result.featureFileHash,
      workflowPath: result.workflowFile,
      workflow: result.workflow,
      srcIp: fileInfo.srcIp,
      srcId: meta.id,
      srcTitle: meta.title,
      srcUuid: meta.uuid,
      program: program,
      steps: tryJsonParse(result.steps),
      metrics: tryJsonParse(result.metrics),
      serviceTag: typeof result.serviceTag === 'string' ? result.serviceTag : null,
      prodLine: typeof result.prodLine === 'string' ? result.prodLine : null,
      leds: tryJsonParse(result.leds),
      hidLamps: tryJsonParse(result.hidLamps),
      gprsNc12: result.gprsNc12 || null,
      gprsOrderFileHash: result.gprsOrderFileHash || null,
      gprsInputFileHash: result.gprsInputFileHash || null,
      gprsOutputFileHash: result.gprsOutputFileHash || null,
      cancelled: result.cancelled === 1
    };
  }

  function tryJsonParse(jsonString)
  {
    if (typeof jsonString !== 'string')
    {
      return null;
    }

    try
    {
      return JSON.parse(jsonString);
    }
    catch (err)
    {
      return null;
    }
  }

  function extractProgramName(featureFileName, nc12)
  {
    if (typeof featureFileName !== 'string' || !featureFileName.length)
    {
      return null;
    }

    return featureFileName
      .replace(/\.([a-zA-Z]+)$/, '')
      .replace(nc12, '')
      .trim()
      .replace(/^[-_ ]+/g, '')
      .replace(/[-_ ]+$/g, '')
      .replace(/^PROGRAM\s*/i, '');
  }

  function saveFeatureFilesStep(err)
  {
    /*jshint validthis:true*/

    if (err && err.code !== 11000)
    {
      return this.skip(err);
    }

    xiconfModule.debug("Saving %d feature file(s)...", this.featureFiles.length);

    var steps = [];

    _.forEach(this.featureFiles, function(featureFile)
    {
      steps.push(async function()
      {
        const contents = await featureFile.async('string');
        const fileHash = featureFile.name.substr('features/'.length);
        const filePath = path.join(xiconfModule.config.featureDbPath, fileHash + '.xml');

        fs.writeFile(filePath, contents, {flag: 'wx'}, this.next());
      });
    });

    const next = this.next();

    steps.push(() => next());

    step(steps);
  }

  function cleanup(hadError, filePath)
  {
    if (hadError)
    {
      fs.move(filePath, filePath + '.bad', {overwrite: true}, function(err)
      {
        if (err)
        {
          xiconfModule.error("Failed to rename a bad input file [%s]: %s", filePath, err.message);
        }
      });
    }
    else
    {
      fs.unlink(filePath, function(err)
      {
        if (err)
        {
          xiconfModule.error("Failed to remove an input file [%s]: %s", filePath, err.message);
        }
      });
    }
  }
};
