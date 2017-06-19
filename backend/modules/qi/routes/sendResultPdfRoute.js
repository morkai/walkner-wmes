// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const spawn = require('child_process').spawn;
const _ = require('lodash');
const step = require('h5.step');

module.exports = function sendResultPdfRoute(app, module, req, res, next)
{
  step(
    function buildPdfStep()
    {
      const next = _.once(this.next());
      const httpServer = app[module.config.httpServerId];
      const url = 'http://' + (httpServer.config.host === '0.0.0.0' ? '127.0.0.1' : httpServer.config.host)
        + ':' + httpServer.config.port + '/qi/results/' + req.params.id + '.html';
      const outputFile = path.join(os.tmpdir(), _.uniqueId('WMES_QI_RESULT_') + '.pdf');
      const args = [
        '--quiet',
        '--dpi', '96',
        '--image-dpi', '600',
        '--image-quality', '100',
        '--page-size', 'A4',
        '--orientation', 'Landscape',
        '-T', '10mm',
        '-R', '10mm',
        '-B', '10mm',
        '-L', '10mm',
        '--no-pdf-compression',
        '--no-outline',
        '--disable-smart-shrinking',
        url,
        outputFile
      ];
      const p = spawn(module.config.wkhtmltopdfExe, args);
      let buffer = '';

      p.stderr.setEncoding('utf8');
      p.stderr.on('data', function(data) { buffer += data; });

      p.on('error', next);
      p.on('exit', function(code)
      {
        var err = code
          ? new Error("wkhtmltopdf exit with code: " + code + "\n" + buffer.trim())
          : null;

        next(err, outputFile);
      });
    },
    function sendFileStep(err, pdfFile)
    {
      if (err)
      {
        return next(err);
      }

      res.type('pdf');
      res.sendFile(pdfFile);

      setTimeout(fs.unlink.bind(fs, pdfFile, function() {}), 30000);
    }
  );
};
