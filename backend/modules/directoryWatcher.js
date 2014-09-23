// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');

exports.DEFAULT_CONFIG = {
  path: './',
  delay: 2500,
  maxDelay: 10000
};

exports.start = function startDirectoryWatcherModule(app, module)
{
  var FILE_NAME_RE = /^(?:([0-9]{10,})@)?(.*?)$/;
  var timer = null;
  var timerStartedAt = -1;
  var readingDir = false;
  var readDirAgain = false;

  app.broker.subscribe('app.started', onAppStart).setLimit(1);

  function onAppStart()
  {
    watchDir();
    readDir();
  }

  function watchDir()
  {
    fs.watch(module.config.path, function(event, fileName)
    {
      if (fileName === null)
      {
        return;
      }

      if (readingDir)
      {
        readDirAgain = true;

        return;
      }

      if (timerStartedAt === -1)
      {
        timerStartedAt = Date.now();
      }

      clearTimeout(timer);

      if (Date.now() - timerStartedAt >= module.config.maxDelay)
      {
        return setImmediate(readDir);
      }

      timer = setTimeout(readDir, module.config.delay);
    });
  }

  function readDir()
  {
    readDirAgain = false;
    readingDir = true;

    fs.readdir(module.config.path, function(err, fileNames)
    {
      timer = null;
      timerStartedAt = -1;
      readingDir = false;

      if (err)
      {
        module.error("Failed to read dir: %s", err.message);
      }
      else
      {
        fileNames
          .map(createFileInfo)
          .sort(function(a, b) { return a.timestamp - b.timestamp; })
          .forEach(function(fileInfo) { app.broker.publish('directoryWatcher.changed', fileInfo); });
      }

      if (readDirAgain)
      {
        setImmediate(readDir);
      }
    });
  }

  function createFileInfo(fileName)
  {
    var fileInfo = {
      moduleId: module.id,
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
