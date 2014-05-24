// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-dac project <http://lukasz.walukiewicz.eu/p/walkner-dac>

'use strict';

var fs = require('fs');
var path = require('path');
var createHash = require('crypto').createHash;
var step = require('h5.step');

exports.DEFAULT_CONFIG = {
  messengerClientId: 'messenger/client',
  nodeId: null,
  journalFile: 'journal.csv',
  dataPath: 'data',
  exportDelay: 0
};

exports.start = function startDacNodeModule(app, module)
{
  var client = app[module.config.messengerClientId];

  if (!client)
  {
    throw new Error("messenger/client module is required!");
  }

  var exporting = 0;
  var buf = '';

  app.broker.subscribe('keyboard', onKeyUp);

  app.broker.subscribe('messenger.client.connected', tryToExportData);

  function onKeyUp(e)
  {
    if (e.identifier === 'ENTER')
    {
      handleCardScan(buf, e.date);

      buf = '';
    }
    else if (/^[A-Z0-9]$/.test(e.identifier))
    {
      buf += e.identifier;
    }
  }

  function handleCardScan(cardId, scanDate)
  {
    var hash = createHash('md5')
      .update(cardId)
      .update(scanDate.getTime().toString())
      .update(Math.random().toString()).digest('hex');
    var line = hash + ';' + cardId + ';' + scanDate.toISOString() + '\n';

    fs.appendFile(module.config.journalFile, line, function(err)
    {
      if (err)
      {
        module.error("Failed to append a line to the journal: %s\nData:\n%s", err.message, line);
      }
      else
      {
        tryToExportData();
      }
    });
  }

  function tryToExportData()
  {
    if (!client.isConnected())
    {
      return;
    }

    ++exporting;

    if (exporting > 1)
    {
      return;
    }

    if (module.config.exportDelay <= 0)
    {
      setImmediate(exportData);
    }
    else
    {
      setTimeout(exportData, module.config.exportDelay);
    }
  }

  function exportData()
  {
    var dataFile = path.join(
      module.config.dataPath,
      Date.now() + Math.random().toString().replace(/^0\./, '') + '.csv'
    );

    fs.rename(module.config.journalFile, dataFile, function(err)
    {
      if (err && err.code !== 'ENOENT')
      {
        module.error("Failed to move the journal file: %s", err.message);
      }

      fs.readdir(module.config.dataPath, function(err, files)
      {
        if (err)
        {
          module.error("Failed to read the data dir: %s", err.message);

          return finishExporting();
        }
        else
        {
          exportFiles(files);
        }
      });
    });
  }

  function finishExporting()
  {
    if (--exporting)
    {
      setImmediate(exportData);
    }
  }

  function exportFiles(dataFiles)
  {
    if (!dataFiles.length)
    {
      return finishExporting();
    }

    step(
      function()
      {
        for (var i = 0, l = dataFiles.length; i < l; ++i)
        {
          exportFile(dataFiles[i], this.parallel());
        }
      },
      finishExporting
    );
  }

  function exportFile(dataFile, done)
  {
    var dataFilePath = path.join(module.config.dataPath, dataFile);

    fs.readFile(dataFilePath, {encoding: 'utf8'}, function(err, data)
    {
      if (err)
      {
        module.error("Failed to read data file [%s]: %s", dataFile, err.message);

        return done();
      }

      var req = {
        nodeId: module.config.nodeId,
        data: data,
        time: Date.now()
      };

      client.request('dac.log', req, function(err)
      {
        if (err)
        {
          module.error("Failed to export file [%s]: %s", dataFile, err.message || err);

          return done();
        }

        fs.unlink(dataFilePath, function(err)
        {
          if (err)
          {
            module.error("Failed to remove file [%s]: %s", dataFile, err.message);
          }

          return done();
        });
      });
    });
  }
};
