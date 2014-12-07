// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var step = require('h5.step');
var JSZip = require('jszip');

module.exports = function setUpIcpoImporter(app, icpoModule)
{
  var licensesModule = app[icpoModule.config.licensesId];
  var mongoose = app[icpoModule.config.mongooseId];
  var IcpoResult = mongoose.model('IcpoResult');

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
    if (fileInfo.moduleId !== icpoModule.config.directoryWatcherId
      || filePathCache[fileInfo.fileName])
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

    icpoModule.debug("Queued %s...", fileInfo.fileName);

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
    icpoModule.debug("Importing %s...", fileInfo.fileName);

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
      saveFilesStep,
      function(err)
      {
        if (err)
        {
          icpoModule.error("Failed to import file [%s]: %s", fileInfo.fileName, err.message);
        }
        else
        {
          icpoModule.info(
            "Imported file [%s] from [%s] (UUID=%s)!",
            fileInfo.fileName,
            this.meta.id,
            this.meta.uuid
          );

          app.broker.publish('icpo.synced');
        }

        this.fileInfo = null;
        this.metaFile = null;
        this.resultsFile = null;
        this.files = null;
        this.meta = null;
        this.results = null;

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

    icpoModule.debug("Reading the archive...");

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

    this.resultsFile = zip.file('results.json');

    if (!this.resultsFile)
    {
      return this.skip(new Error('MISSING_RESULTS_FILE'));
    }

    this.files = zip.file(/^files\//);
  }

  function validateLicenseStep()
  {
    /*jshint validthis:true*/

    icpoModule.debug("Validating the meta file...");

    try
    {
      this.meta = JSON.parse(this.metaFile.asText());
    }
    catch (err)
    {
      icpoModule.debug("Failed to parse the meta JSON: %s", err.message);

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
      this.meta.uuid = licensesModule.licenseEdKey.decrypt(encryptedUuid, 'base64', 'utf8');
    }
    catch (err)
    {
      icpoModule.debug("Failed to decrypt the UUID: %s", err.message);

      return this.skip(new Error('INVALID_ENCRYPTED_UUID'));
    }

    validEncryptedUuids[encryptedUuid] = this.meta.uuid;
  }

  function parseModelsStep()
  {
    /*jshint validthis:true*/

    icpoModule.debug("Parsing the models...");

    try
    {
      this.results = JSON.parse(this.resultsFile.asText());
    }
    catch (err)
    {
      icpoModule.debug("Failed to parse results file: %s", err.message);
    }

    this.results = Array.isArray(this.results)
      ? this.results.map(prepareResult.bind(null, this.fileInfo, this.meta))
      : [];
  }

  function updateModelsStep()
  {
    /*jshint validthis:true*/

    if (!this.results.length)
    {
      return this.skip(new Error('NO_RESULTS'));
    }

    icpoModule.debug("Updating the models...");

    if (this.results.length)
    {
      IcpoResult.collection.insert(this.results, {continueOnError: true}, this.parallel());
    }
  }

  function prepareResult(fileInfo, meta, result)
  {
    var log = null;

    try
    {
      log = JSON.parse(result.log);
    }
    catch (err) {}

    return {
      _id: result._id,
      serviceTag: result.serviceTag,
      orderFilePath: result.orderFilePath,
      orderFileHash: result.orderFileHash,
      driver: result.driver,
      driverFilePath: result.driverFilePath,
      driverFileHash: result.driverFileHash,
      gprs: result.gprs,
      gprsFilePath: result.gprsFilePath,
      gprsFileHash: result.gprsFileHash,
      led: result.led,
      startedAt: new Date(result.startedAt),
      finishedAt: new Date(result.finishedAt),
      log: log,
      result: result.result,
      errorCode: result.errorCode ? result.errorCode : null,
      exception: result.exception,
      output: result.output,
      inputFileHash: result.inputFileHash,
      outputFileHash: result.outputFileHash,
      srcIp: fileInfo.srcIp,
      srcId: meta.id,
      srcTitle: meta.title,
      srcUuid: meta.uuid
    };
  }

  function saveFilesStep(err)
  {
    /*jshint validthis:true*/

    if (err && err.code !== 11000)
    {
      return this.skip(err);
    }

    icpoModule.debug("Saving %d file(s)...", this.files.length);

    var steps = [];

    this.files.forEach(function(file)
    {
      steps.push(function()
      {
        var contents = file.asText();
        var fileHash = file.name.substr('files/'.length);
        var filePath = path.join(icpoModule.config.fileStoragePath, fileHash);

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
          icpoModule.error("Failed to rename a bad input file [%s]: %s", filePath, err.message);
        }
      });
    }
    else
    {
      fs.unlink(filePath, function(err)
      {
        if (err)
        {
          icpoModule.error("Failed to remove an input file [%s]: %s", filePath, err.message);
        }
      });
    }
  }
};
