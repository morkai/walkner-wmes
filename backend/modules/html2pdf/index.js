// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const {join} = require('path');
const {exec, execFile} = require('child_process');
const {format} = require('util');
const {tmpdir} = require('os');
const fs = require('fs');
const step = require('h5.step');
const _ = require('lodash');
const createPuppeteerPool = require('puppeteer-pool');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  mongooseId: 'mongoose',
  fileUrl: 'http://localhost/html2pdf/${hash}.${format}',
  storagePath: './data/html2pdf',
  poolOptions: {},
  sumatraExe: 'SumatraPDF.exe',
  zintExe: 'zint',
  spoolExe: 'spool.exe'
};

exports.start = function startHtml2pdfModule(app, module)
{
  module.pool = createPuppeteerPool(_.defaults({}, module.config.poolOptions, {
    min: 2,
    max: 5,
    idleTimeoutMillis: 30000,
    maxUses: 50,
    puppeteerArgs: {}
  }));

  app.onModuleReady(
    [
      module.config.expressId,
      module.config.mongooseId
    ],
    setUpRoutes.bind(null, app, module)
  );

  module.generateQrCode = function(data, options, done)
  {
    const cmd = format(
      '"%s" --barcode=58 --vers=%s --scale=%s --notext --directpng --data="%s"',
      module.config.zintExe,
      options && options.vers || 5,
      options && options.scale || 1,
      data
    );

    exec(cmd, {encoding: 'buffer'}, function(err, stdout)
    {
      if (err)
      {
        return done(err);
      }

      return done(null, stdout.toString('base64'));
    });
  };

  module.generatePdf = function(html, userOptions, done)
  {
    const options = {
      orientation: 'portrait',
      format: 'A4',
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    };

    Object.keys(options).forEach(k =>
    {
      if (userOptions && userOptions[k] !== undefined)
      {
        options[k] = userOptions[k];
      }
    });

    const hash = createHash('md5').update(html).update(JSON.stringify(options)).digest('hex');

    step(
      function()
      {
        fs.stat(join(module.config.storagePath, `${hash}.pdf`), this.next());
      },
      function(err, stats) // eslint-disable-line handle-callback-err
      {
        if (stats && stats.isFile())
        {
          return this.skip();
        }

        fs.writeFile(join(module.config.storagePath, `${hash}.html`), html, this.next());
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
              landscape: options.orientation === 'landscape',
              pageRanges: '',
              format: options.format,
              margin: options.margin
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
          return done(err);
        }

        done(null, {hash});
      }
    );
  };

  module.printPdf = function(hash, printer, settings, done)
  {
    const Printer = app[module.config.mongooseId].model('Printer');
    const pdfFilePath = join(module.config.storagePath, `${hash}.pdf`);

    step(
      function()
      {
        fs.stat(pdfFilePath, this.parallel());

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

        if (!printer)
        {
          module.warn(`Can't print [${pdfFilePath}]: invalid printer: ${printer}`);

          return this.skip(app.createError('INVALID_PRINTER', 400));
        }

        const cmd = [
          `"${module.config.sumatraExe}"`,
          `-print-to "${printer.name}"`,
          `-print-settings "${settings || 'fit'}"`,
          `"${pdfFilePath}"`
        ];

        exec(cmd.join(' '), this.next());
      },
      done
    );
  };

  module.printZpl = (zpl, printer, done) =>
  {
    const Printer = app[module.config.mongooseId].model('Printer');
    const labelFilePath = join(tmpdir(), `WMES.${Date.now()}.${Math.random()}.zpl`);

    step(
      function()
      {
        Printer.findById(printer).lean().exec(this.parallel());

        fs.writeFile(labelFilePath, zpl, this.parallel());
      },
      function(err, printer)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (process.platform === 'win32')
        {
          execFile(module.config.spoolExe, [labelFilePath, printer.name], this.next());
        }
        else
        {
          const matches = printer.label.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)(:[0-9]+)?/);

          if (!matches)
          {
            return this.skip(app.createError(`No printer address found: ${printer.label}`, 'INVALID_PRINTER', 500));
          }

          const host = matches[1];
          const port = (matches[2] || ':9100').substring(1);

          exec(`cat "${labelFilePath}" | netcat -w 1 ${host} ${port}`, this.next());
        }
      },
      function(err)
      {
        fs.unlink(labelFilePath, () => {});

        done(err);
      }
    );
  };
};
