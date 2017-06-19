// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const JSZip = require('jszip');
const fs = require('fs-extra');

module.exports = function setUpIcpoImporter(app, icpoModule)
{
  const licensesModule = app[icpoModule.config.licensesId];
  const mongoose = app[icpoModule.config.mongooseId];
  const IcpoResult = mongoose.model('IcpoResult');

  const RESULTS_BATCH_SIZE = 1000;
  const FILTER_RE = /^(.*?)@[a-z0-9]{32}\.zip$/;

  let importing = false;
  const filePathCache = {};
  const fileQueue = [];
  const validEncryptedUuids = {};
  let restarting = false;

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

    const matches = fileInfo.fileName.match(FILTER_RE);

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

    icpoModule.debug('Queued %s...', fileInfo.fileName);

    importNextFile();
  }

  function importNextFile()
  {
    if (importing || restarting)
    {
      return;
    }

    const fileInfo = fileQueue.shift();

    if (fileInfo)
    {
      importFile(fileInfo);
    }
  }

  function importFile(fileInfo)
  {
    icpoModule.debug('Importing %s...', fileInfo.fileName);

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
      saveFilesStep,
      function(err)
      {
        if (err)
        {
          icpoModule.error('Failed to import file [%s]: %s', fileInfo.fileName, err.message);
        }
        else
        {
          icpoModule.info(
            'Imported file [%s] from [%s] (UUID=%s)!',
            fileInfo.fileName,
            this.meta.id,
            this.meta.uuid
          );

          app.broker.publish('icpo.results.synced');
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

  async function readArchiveFileStep()
  {
    /* jshint validthis:true*/

    icpoModule.debug('Reading the archive...');

    const buf = fs.readFile(this.fileInfo.filePath);
    const zip = await new JSZip().loadAsync(buf);

    this.meta = JSON.parse(await zip.file('meta.json').async('string'));
    this.results = JSON.parse(await zip.file('results.json').async('string'));
    this.files = zip.file(/^files\//);
  }

  function validateLicenseStep(err)
  {
    /* jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    icpoModule.debug('Validating the meta file...');

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
      icpoModule.debug('Failed to decrypt the UUID: %s', err.message);

      return this.skip(new Error('INVALID_ENCRYPTED_UUID'));
    }

    validEncryptedUuids[encryptedUuid] = this.meta.uuid;
  }

  function parseModelsStep()
  {
    /* jshint validthis:true*/

    icpoModule.debug('Parsing the models...');

    this.results = Array.isArray(this.results)
      ? this.results.map(prepareResult.bind(null, this.fileInfo, this.meta))
      : [];
  }

  function updateModelsStep()
  {
    /* jshint validthis:true*/

    if (!this.results.length)
    {
      return this.skip(new Error('NO_RESULTS'));
    }

    icpoModule.debug('Updating the models...');

    for (let i = 0, l = Math.ceil(this.results.length / RESULTS_BATCH_SIZE); i < l; ++i)
    {
      IcpoResult.collection.insert(
        this.results.slice(i * RESULTS_BATCH_SIZE, i * RESULTS_BATCH_SIZE + RESULTS_BATCH_SIZE),
        {ordered: false},
        this.parallel()
      );
    }
  }

  function prepareResult(fileInfo, meta, result)
  {
    let log = null;

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
    /* jshint validthis:true*/

    if (err && err.code !== 11000)
    {
      return this.skip(err);
    }

    icpoModule.debug('Saving %d file(s)...', this.files.length);

    const steps = [];

    _.forEach(this.files, function(file)
    {
      steps.push(async function()
      {
        const contents = await file.async('string');
        const fileHash = file.name.substr('files/'.length);
        const filePath = path.join(icpoModule.config.fileStoragePath, fileHash);

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
          icpoModule.error('Failed to rename a bad input file [%s]: %s', filePath, err.message);
        }
      });
    }
    else
    {
      fs.unlink(filePath, function(err)
      {
        if (err)
        {
          icpoModule.error('Failed to remove an input file [%s]: %s', filePath, err.message);
        }
      });
    }
  }
};
