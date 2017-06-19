// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const createHash = require('crypto').createHash;
const step = require('h5.step');
const fs = require('fs-extra');

exports.DEFAULT_CONFIG = {
  messengerClientId: 'messenger/client',
  nodeId: null,
  journalFile: 'journal.csv',
  dataPath: 'data',
  exportDelay: 0
};

exports.start = function startDacNodeModule(app, module)
{
  const client = app[module.config.messengerClientId];

  if (!client)
  {
    throw new Error('messenger/client module is required!');
  }

  let exporting = 0;
  let buf = '';

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
    const hash = createHash('md5')
      .update(cardId)
      .update(scanDate.getTime().toString())
      .update(Math.random().toString()).digest('hex');
    const line = hash + ';' + cardId + ';' + scanDate.toISOString() + '\n';

    fs.appendFile(module.config.journalFile, line, function(err)
    {
      if (err)
      {
        module.error('Failed to append a line to the journal: %s\nData:\n%s', err.message, line);
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
    const dataFile = path.join(
      module.config.dataPath,
      Date.now() + Math.random().toString().replace(/^0\./, '') + '.csv'
    );

    fs.move(module.config.journalFile, dataFile, {overwrite: true}, function(err)
    {
      if (err && err.code !== 'ENOENT')
      {
        module.error('Failed to move the journal file: %s', err.message);
      }

      fs.readdir(module.config.dataPath, function(err, files)
      {
        if (err)
        {
          module.error('Failed to read the data dir: %s', err.message);

          return finishExporting();
        }

        exportFiles(files);
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
        for (let i = 0, l = dataFiles.length; i < l; ++i)
        {
          exportFile(dataFiles[i], this.parallel());
        }
      },
      finishExporting
    );
  }

  function exportFile(dataFile, done)
  {
    const dataFilePath = path.join(module.config.dataPath, dataFile);

    fs.readFile(dataFilePath, {encoding: 'utf8'}, function(err, data)
    {
      if (err)
      {
        module.error('Failed to read data file [%s]: %s', dataFile, err.message);

        return done();
      }

      const req = {
        nodeId: module.config.nodeId,
        data: data,
        time: Date.now()
      };

      client.request('dac.log', req, function(err)
      {
        if (err)
        {
          module.error('Failed to export file [%s]: %s', dataFile, err.message || err);

          return done();
        }

        fs.unlink(dataFilePath, function(err)
        {
          if (err)
          {
            module.error('Failed to remove file [%s]: %s', dataFile, err.message);
          }

          return done();
        });
      });
    });
  }
};
