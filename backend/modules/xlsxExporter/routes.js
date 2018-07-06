// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {randomBytes} = require('crypto');

module.exports = function setUpXlsxExporterRoutes(app, module)
{
  const express = app[module.config.expressId];
  const auth = app[module.config.userId].auth;

  const canView = auth('USER');

  const exportData = new Map();

  express.post('/xlsxExporter', canView, setUpExportRoute);

  express.get('/xlsxExporter/:id', canView, exportRoute);

  function setUpExportRoute(req, res, next)
  {
    randomBytes(10, (err, buf) =>
    {
      if (err)
      {
        return next(err);
      }

      const id = buf.toString('hex');

      exportData.set(id, {
        body: req.body,
        timer: setTimeout(() => exportData.delete(id), 2 * 60 * 1000)
      });

      res.json(id);
    });
  }

  function exportRoute(req, res, next)
  {
    const {id} = req.params;

    if (!exportData.has(id))
    {
      return next(app.createError(`Export not found: ${id}`, 'NOT_FOUND', 404));
    }

    const {body} = exportData.get(id);
    const options = Object.assign({}, body, {
      cursor: null,
      serializeStream: (cursor, emitter) =>
      {
        emitter.emit('data', body.data);
        emitter.emit('end');
      }
    });

    req.params.format = 'xlsx';

    express.crud.exportRoute(app, options, req, res, next);
  }
};
