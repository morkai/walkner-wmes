// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const {join} = require('path');
const {stat, writeFile} = require('fs');
const {exec} = require('child_process');
const step = require('h5.step');

module.exports = function setUpHtml2pdfRoutes(app, module)
{
  const express = app[module.config.expressId];
  const mongoose = app[module.config.mongooseId];
  const Printer = mongoose.model('Printer');

  express.get('/html2pdf/:id.(:format)', readFileRoute);

  express.post('/html2pdf', generatePdfRoute);

  express.post('/html2pdf;print', printPdfRoute);

  function readFileRoute(req, res, next)
  {
    if (!/^[a-z0-9]{32}$/.test(req.params.id) || (req.params.format !== 'pdf' && req.params.format !== 'html'))
    {
      return next(app.createError('INPUT', 400));
    }

    res.sendFile(join(module.config.storagePath, `${req.params.id}.${req.params.format}`));
  }

  function generatePdfRoute(req, res, next)
  {
    const html = req.body;
    const hash = createHash('md5').update(html).digest('hex');

    step(
      function()
      {
        stat(join(module.config.storagePath, `${hash}.pdf`), this.next());
      },
      function(err, stats) // eslint-disable-line handle-callback-err
      {
        if (stats && stats.isFile())
        {
          return this.skip();
        }

        writeFile(join(module.config.storagePath, `${hash}.html`), html, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        const next = this.next();

        try
        {
          module.pool.use(async browser =>
          {
            const page = await browser.newPage();
            const res = await page.goto(
              module.config.fileUrl.replace('${hash}', hash).replace('${format}', 'html'),
              {waitUntil: 'networkidle2'}
            );

            if (!res || !res.ok())
            {
              throw app.createError('INVALID_STATUS', 500);
            }

            await page.emulateMedia('print');
            await page.pdf({
              path: join(module.config.storagePath, `${hash}.pdf`),
              scale: 1,
              displayHeaderFooter: false,
              printBackground: true,
              landscape: false,
              pageRanges: '',
              format: 'A4',
              margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
              }
            });

            page.close();
          }).then(next, next);
        }
        catch (err)
        {
          next(err);
        }
      },
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        res.json({hash});
      }
    );
  }

  function printPdfRoute(req, res, next)
  {
    const {hash, printer} = req.body;
    const pdfFilePath = join(module.config.storagePath, `${hash}.pdf`);

    step(
      function()
      {
        stat(pdfFilePath, this.parallel());

        Printer.findById(printer).lean().exec(this.parallel());
      },
      function(err, stats, printer)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!stats || !stats.isFile())
        {
          return this.skip(app.createError('INVALID_HASH', 400));
        }

        const cmd = `"${module.config.sumatraExe}" -print-to "${printer.name}" -print-settings "fit" "${pdfFilePath}"`;

        exec(cmd, this.next());
      },
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        res.sendStatus(204);
      }
    );
  }
};
