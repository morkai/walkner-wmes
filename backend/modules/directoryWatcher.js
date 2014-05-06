// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');

exports.DEFAULT_CONFIG = {
  path: './'
};

exports.start = function startDirectoryWatcherModule(app, module)
{
  var FILE_NAME_RE = /^(?:([0-9]{10,})@)?(.*?)$/;

  app.broker.subscribe('app.started', onAppStart).setLimit(1);

  function onAppStart()
  {
    fs.watch(module.config.path, function(event, fileName)
    {
      if (fileName !== null)
      {
        app.broker.publish('directoryWatcher.changed', createFileInfo(fileName));
      }
    });

    fs.readdir(module.config.path, function(err, fileNames)
    {
      if (err)
      {
        return module.error("Failed to read dir: %s", err.message);
      }

      fileNames.sort().forEach(publishCreatedMessage);
    });
  }

  function publishCreatedMessage(fileName)
  {
    app.broker.publish('directoryWatcher.created', createFileInfo(fileName));
  }

  function createFileInfo(fileName)
  {
    var fileInfo = {
      timestamp: -1,
      fileName: fileName,
      filePath: path.resolve(module.config.path, fileName)
    };

    var matches = fileName.match(FILE_NAME_RE);

    if (matches !== null)
    {
      fileInfo.timestamp = parseInt(matches[1], 10) * 1000;
      fileInfo.fileName = matches[2];
    }

    return fileInfo;
  }
};
