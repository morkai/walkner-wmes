// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {exec} = require('child_process');

const WMIC_PRINTER_PROPS = {
  Caption: 'caption',
  Comment: 'comment',
  Name: 'name',
  ServerName: 'serverName',
  ShareName: 'shareName'
};

module.exports = function setUpPrintingRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Printer = mongoose.model('Printer');

  const canView = userModule.auth('LOCAL', 'USER');
  const canManage = userModule.auth('DICTIONARIES:MANAGE');

  express.get('/printing/printers', canView, express.crud.browseRoute.bind(null, app, Printer));

  express.post('/printing/printers', canManage, express.crud.addRoute.bind(null, app, Printer));

  express.get('/printing/printers/:id', canView, express.crud.readRoute.bind(null, app, Printer));

  express.put('/printing/printers/:id', canManage, express.crud.editRoute.bind(null, app, Printer));

  express.delete('/printing/printers/:id', canManage, express.crud.deleteRoute.bind(null, app, Printer));

  express.get('/printing/systemPrinters', canView, readSystemPrintersRoute);

  function readSystemPrintersRoute(req, res, next)
  {
    if (process.platform !== 'win32')
    {
      return res.json({
        totalCount: 0,
        collection: []
      });
    }

    exec('WMIC PRINTER LIST FULL', (err, stdout) =>
    {
      if (err)
      {
        return next(err);
      }

      const collection = [];

      stdout.split('\n').forEach(line =>
      {
        const parts = line.trim().split('=');
        const key = parts.shift();
        const value = parts.join('=');

        if (!key.length)
        {
          return;
        }

        if (key === 'Attributes')
        {
          collection.push({
            caption: '',
            comment: '',
            name: '',
            serverName: '',
            shareName: ''
          });
        }
        else if (WMIC_PRINTER_PROPS[key])
        {
          collection[collection.length - 1][WMIC_PRINTER_PROPS[key]] = value;
        }
      });

      res.json({
        totalCount: collection.length,
        collection
      });
    });
  }
};