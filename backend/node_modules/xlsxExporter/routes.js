// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {randomBytes} = require('crypto');
const os = require('os');
const fs = require('fs-extra');
const multer = require('multer');
const step = require('h5.step');

module.exports = function setUpXlsxExporterRoutes(app, module)
{
  const express = app[module.config.expressId];
  const auth = app[module.config.userId].auth;

  const canView = auth('USER');

  const exportData = new Map();

  express.post(
    '/xlsxExporter',
    canView,
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 2,
        fileSize: 30 * 1024 * 1024
      }
    }).fields([
      {name: 'meta', maxCount: 1},
      {name: 'data', maxCount: 1}
    ]),
    setUpExportRoute
  );

  express.get('/xlsxExporter/:id', canView, exportRoute);

  function setUpExportRoute(req, res, next)
  {
    const files = {
      meta: null,
      data: null
    };

    if (req.files && req.files.meta && req.files.data)
    {
      files.meta = req.files.meta[0];
      files.data = req.files.data[0];

      if (!files.meta || !files.data)
      {
        return next(app.createError(`Invalid files.`, 'INPUT', 400));
      }
    }

    randomBytes(10, (err, buf) =>
    {
      if (err)
      {
        return next(err);
      }

      const id = buf.toString('hex');

      exportData.set(id, {
        body: req.body,
        files,
        timer: setTimeout(cleanUp, 2 * 60 * 1000, id)
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

    const {body, files} = exportData.get(id);

    if (files.meta && files.data)
    {
      exportFromFiles(files, req, res, next);
    }
    else
    {
      exportFromBody(body, req, res, next);
    }
  }

  function exportFromBody(body, req, res, next)
  {
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

  function exportFromFiles({meta, data}, req, res, next)
  {
    step(
      function()
      {
        fs.readFile(meta.path, 'utf8', this.parallel());
      },
      function(err, metaJson)
      {
        if (err)
        {
          return this.skip(err);
        }

        try
        {
          this.meta = JSON.parse(metaJson);
        }
        catch (err)
        {
          return this.skip(err);
        }

        fs.open(data.path, 'r', this.next());
      },
      function(err, fd)
      {
        if (err)
        {
          return next(err);
        }

        const options = Object.assign(this.meta, {
          cursor: null,
          serializeStream: (cursor, emitter) =>
          {
            exportNextFromFile(emitter, fd, Buffer.allocUnsafe(32 * 1024), '');
          }
        });

        req.params.format = 'xlsx';

        express.crud.exportRoute(app, options, req, res, next);
      }
    );
  }

  function exportNextFromFile(emitter, fd, readBuffer, workBuffer)
  {
    fs.read(fd, readBuffer, 0, readBuffer.length, null, (err, bytesRead) =>
    {
      if (err)
      {
        module.error(`Failed to read next data from file: ${err.message}`);

        return finalizeExportFromFile(fd, emitter);
      }

      if (bytesRead)
      {
        workBuffer += readBuffer.toString('utf8', 0, bytesRead);
      }

      const eof = bytesRead < readBuffer.length;

      try
      {
        while (true) // eslint-disable-line no-constant-condition
        {
          const eol = workBuffer.indexOf('\n');

          if (eol === -1)
          {
            if (eof)
            {
              return finalizeExportFromFile(fd, emitter);
            }

            break;
          }

          const line = workBuffer.substring(0, eol);

          emitter.emit('data', JSON.parse(line));

          workBuffer = workBuffer.substring(eol + 1);
        }
      }
      catch (err)
      {
        module.error(`Failed to parse JSON line: ${err.message}`);

        return finalizeExportFromFile(fd, emitter);
      }

      if (eof)
      {
        finalizeExportFromFile(fd, emitter);
      }
      else
      {
        exportNextFromFile(emitter, fd, readBuffer, workBuffer);
      }
    });
  }

  function finalizeExportFromFile(fd, emitter)
  {
    fs.close(fd, () => {});

    emitter.emit('end');
  }

  function cleanUp(id)
  {
    const {files} = exportData.get(id) || {};

    Object.keys(files).forEach(k =>
    {
      if (files[k])
      {
        fs.unlink(files[k].path, () => {});
      }
    });

    exportData.delete(id);
  }
};
