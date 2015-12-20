// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var zlib = require('zlib');
var step = require('h5.step');
var request = require('request');

exports.DEFAULT_CONFIG = {
  maxConcurrentUploads: 5,
  filterRe: /^T_((ZOIN(_.*?)?)|(COOIS_(EMPTY_)?(ORDERS|OPERS)_([0-9]+)))\.txt$/,
  uploadUrl: 'http://127.0.0.1/orders;import'
};

exports.start = function startOrdersExporterModule(app, module)
{
  var filePathCache = {};
  var exportQueue = [];

  app.broker.subscribe('directoryWatcher.changed', exportFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    return !filePathCache[fileInfo.filePath] && module.config.filterRe.test(fileInfo.fileName);
  }

  function exportFile(fileInfo)
  {
    if (Object.keys(filePathCache).length >= module.config.maxConcurrentUploads)
    {
      module.debug("Delaying export of: %s", fileInfo.fileName);

      exportQueue.push(fileInfo);

      return;
    }

    filePathCache[fileInfo.filePath] = true;

    module.debug("Exporting: %s", fileInfo.fileName);

    step(
      function readFileStep()
      {
        fs.readFile(fileInfo.filePath, 'utf8', this.next());
      },
      function prepareBodyStep(err, fileContents)
      {
        if (err)
        {
          return this.skip(err);
        }

        zlib.deflate(fileContents, this.next());
      },
      function uploadStep(err, body)
      {
        if (err)
        {
          return this.skip(err);
        }

        var requestOptions = {
          url: module.config.uploadUrl,
          method: 'POST',
          headers: {
            'content-type': 'text/plain',
            'content-encoding': 'deflate'
          },
          qs: {
            fileName: fileInfo.fileName,
            timestamp: Math.floor(fileInfo.timestamp / 1000)
          },
          body: body
        };

        request(requestOptions, this.next());
      },
      function handleResponseStep(err, res)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (res.statusCode !== 204)
        {
          return this.skip(new Error("Server returned status code " + res.statusCode + "."));
        }
      },
      function cleanUpStep(err)
      {
        if (err)
        {
          module.error("Failed to export [%s]: %s", fileInfo.fileName, err.message);

          delete filePathCache[fileInfo.filePath];

          setImmediate(exportNext);
        }
        else
        {
          module.info("Exported: %s", fileInfo.fileName);

          fs.unlink(fileInfo.filePath, function(err)
          {
            if (err)
            {
              module.error("Failed to delete file [%s]: %s", fileInfo.filePath, err.message);
            }

            delete filePathCache[fileInfo.filePath];

            setImmediate(exportNext);
          });
        }
      }
    );
  }

  function exportNext()
  {
    var currentUploadsCount = Object.keys(filePathCache).length;
    var availableUploadsCount = module.config.maxConcurrentUploads - currentUploadsCount;
    var toUploadCount = Math.min(availableUploadsCount, exportQueue.length);

    for (var i = 0; i < toUploadCount; ++i)
    {
      exportFile(exportQueue.shift());
    }
  }
};
