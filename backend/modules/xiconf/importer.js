// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var step = require('h5.step');
var JSZip = require('jszip');

module.exports = function setUpXiconfImporter(app, xiconfModule)
{
  var mongoose = app[xiconfModule.config.mongooseId];
  var XiconfOrder = mongoose.model('XiconfOrder');
  var XiconfResult = mongoose.model('XiconfResult');

  var FILTER_RE = /^(.*?)@[a-z0-9]{32}\.zip$/;

  var importing = false;
  var filePathCache = {};
  var fileQueue = [];
  var validEncryptedUuids = {};

  app.broker.subscribe('directoryWatcher.created', enqueueFile).setFilter(filterFile);
  app.broker.subscribe('directoryWatcher.changed', enqueueFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (filePathCache[fileInfo.fileName])
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
    if (importing)
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
      openArchiveStep,
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

          app.broker.publish('xiconf.synced', {
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

  function readArchiveFileStep()
  {
    /*jshint validthis:true*/

    xiconfModule.debug("Reading the archive...");

    fs.readFile(this.fileInfo.filePath, this.next());
  }

  function openArchiveStep(err, buf)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    var zip = new JSZip(buf);

    this.metaFile = zip.file('meta.json');

    if (!this.metaFile)
    {
      return this.skip(new Error('MISSING_META_FILE'));
    }

    this.ordersFile = zip.file('orders.json');

    if (!this.ordersFile)
    {
      return this.skip(new Error('MISSING_ORDERS_FILE'));
    }

    this.resultsFile = zip.file('results.json');

    if (!this.resultsFile)
    {
      return this.skip(new Error('MISSING_RESULTS_FILE'));
    }

    this.featureFiles = zip.file(/^features\//);
  }

  function validateLicenseStep()
  {
    /*jshint validthis:true*/

    xiconfModule.debug("Validating the meta file...");

    try
    {
      this.meta = JSON.parse(this.metaFile.asText());
    }
    catch (err)
    {
      xiconfModule.debug("Failed to parse the meta JSON: %s", err.message);

      return this.skip(new Error('INVALID_META_FILE'));
    }

    var encryptedUuid = this.meta.uuid;

    if (validEncryptedUuids[encryptedUuid])
    {
      this.meta.uuid = validEncryptedUuids[encryptedUuid];

      return;
    }

    try
    {
      this.meta.uuid = xiconfModule.licenseEdKey.decrypt(encryptedUuid, 'base64', 'utf8');
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

    try
    {
      this.orders = JSON.parse(this.ordersFile.asText());
    }
    catch (err)
    {
      xiconfModule.debug("Failed to parse orders file: %s", err.message);
    }

    this.orders = Array.isArray(this.orders)
      ? this.orders.map(prepareOrder.bind(null, this.fileInfo, this.meta))
      : [];

    var orderIdToNo = {};

    this.orders.forEach(function(order)
    {
      orderIdToNo[order._id] = order.no;
    });

    this.orderIds = Object.keys(orderIdToNo);

    try
    {
      this.results = JSON.parse(this.resultsFile.asText());
    }
    catch (err)
    {
      xiconfModule.debug("Failed to parse results file: %s", err.message);
    }

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

    xiconfModule.debug("Updating the models...");

    for (var i = 0, l = this.orders.length; i < l; ++i)
    {
      XiconfOrder.collection.update(
        {_id: this.orders[i]._id}, this.orders[i], {upsert: true}, this.parallel()
      );
    }

    if (this.results.length)
    {
      XiconfResult.collection.insert(this.results, {continueOnError: true}, this.parallel());
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
    var log = null;

    try
    {
      log = JSON.parse(result.log);
    }
    catch (err) {}

    return {
      _id: result._id,
      order: result._order || null,
      orderNo: orderIdToNo[result._order] || null,
      nc12: result.nc12,
      counter: result.counter,
      startedAt: new Date(result.startedAt),
      finishedAt: new Date(result.finishedAt),
      duration: result.duration,
      log: log,
      result: result.result,
      errorCode: result.errorCode ? result.errorCode : null,
      exception: result.exception,
      output: result.output,
      programName: extractProgramName(result.featureFileName, result.nc12),
      featurePath: result.featureFile,
      featureName: result.featureFileName,
      featureHash: result.featureFileHash,
      workflowPath: result.workflowFile,
      workflow: result.workflow,
      srcIp: fileInfo.srcIp,
      srcId: meta.id,
      srcTitle: meta.title,
      srcUuid: meta.uuid
    };
  }

  function extractProgramName(featureFileName, nc12)
  {
    if (typeof featureFileName !== 'string' || !featureFileName.length)
    {
      return null;
    }

    return featureFileName
      .replace('.xml', '')
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

    this.featureFiles.forEach(function(featureFile)
    {
      steps.push(function()
      {
        var contents = featureFile.asText();
        var intro = contents.substr(0, 100);

        if (!/<\?xml.*?\?>/.test(intro))
        {
          return;
        }

        var fileHash = featureFile.name.substr('features/'.length);
        var filePath = path.join(xiconfModule.config.featureDbPath, fileHash + '.xml');

        fs.writeFile(filePath, contents, {flag: 'wx'}, this.next());
      });
    });

    var next = this.next();

    steps.push(function() { next(); });

    step(steps);
  }

  function cleanup(hadError, filePath)
  {
    if (hadError)
    {
      fs.rename(filePath, filePath + '.bad', function(err)
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
