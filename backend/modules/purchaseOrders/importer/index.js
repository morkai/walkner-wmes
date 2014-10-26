// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var parsePoList = require('./parsePoList');
var comparePoList = require('./comparePoList');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^Job .*?_OPEN_PO_D, Step ([0-9]+)\.html?$/,
  stepToPGr: {},
  requireMatchingPGr: false,
  parsedOutputDir: null
};

exports.start = function startPurchaseOrdersImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var filePathCache = {};
  var importQueue = [];
  var importLock = false;

  app.broker.subscribe('directoryWatcher.changed', enqueueAndImport).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (filePathCache[fileInfo.filePath])
    {
      return;
    }

    var matches = fileInfo.fileName.match(module.config.filterRe);

    if (matches === null)
    {
      return false;
    }

    fileInfo.step = parseInt(matches[1], 10);

    return true;
  }

  function enqueueAndImport(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    importQueue.push(fileInfo);

    importNext();
  }

  function importNext()
  {
    if (importLock || !importQueue.length)
    {
      return;
    }

    importLock = true;

    var fileInfo = importQueue.shift();
    var filePath = fileInfo.filePath;
    var pGrs = module.config.stepToPGr[fileInfo.step];

    if (!Array.isArray(pGrs) || !pGrs.length)
    {
      module.info(
        "Ignoring step [%d] of [%s] because it doesn't have any purchase groups...",
        fileInfo.step,
        fileInfo.fileName
      );

      return finishImport(filePath);
    }

    fs.readFile(filePath, {encoding: 'utf8'}, function(err, html)
    {
      if (err)
      {
        module.error("Failed to read the contents of [%s]: %s", filePath, err.message);

        return finishImport(filePath);
      }

      var importedAt = new Date(fileInfo.timestamp);

      module.debug(
        "Parsing [%s] received at [%s]...",
        fileInfo.fileName,
        moment(importedAt).format('YYYY-MM-DD HH:mm:ss')
      );

      var purchaseOrders = {};

      if (parsePoList(html, importedAt, purchaseOrders) > 0)
      {
        comparePoList(app, module, pGrs, purchaseOrders, function() { finishImport(filePath); });
        createVendors(purchaseOrders);
      }
      else
      {
        finishImport(filePath);
      }
    });
  }

  function finishImport(filePath)
  {
    setTimeout(function() { delete filePathCache[filePath]; }, 15000);
    cleanUpFile(filePath);
    unlockImport();
  }

  function unlockImport()
  {
    importLock = false;

    setImmediate(importNext);
  }

  function cleanUpFile(filePath)
  {
    if (module.config.parsedOutputDir)
    {
      moveFile(filePath);
    }
    else
    {
      deleteFile(filePath);
    }
  }

  function moveFile(oldFilePath)
  {
    var newFilePath = path.join(module.config.parsedOutputDir, path.basename(oldFilePath));

    fs.rename(oldFilePath, newFilePath, function(err)
    {
      if (err)
      {
        module.error(
          "Failed to rename file [%s] to [%s]: %s", oldFilePath, newFilePath, err.message
        );
      }
    });
  }

  function deleteFile(filePath)
  {
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        module.error("Failed to delete file [%s]: %s", filePath, err.message);
      }
    });
  }

  function createVendors(purchaseOrders)
  {
    var vendorMap = {};

    Object.keys(purchaseOrders).forEach(function(key)
    {
      var po = purchaseOrders[key];

      vendorMap[po.vendor] = po.vendorName;
    });

    var vendorList = [];

    Object.keys(vendorMap).forEach(function(vendorId)
    {
      vendorList.push({
        _id: vendorId,
        name: vendorMap[vendorId]
      });
    });

    mongoose.model('Vendor').collection.insert(vendorList, {continueOnError: true}, function() {});
  }
};
