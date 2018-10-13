// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const {join} = require('path');
const {exec, execFile} = require('child_process');
const {tmpdir} = require('os');
const fs = require('fs');
const step = require('h5.step');
const _ = require('lodash');
const request = require('request');
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
  spoolExe: 'spool.exe',
  ncatExe: 'ncat'
};

exports.start = function startHtml2pdfModule(app, module)
{
  const zintVersion = [0, 0];

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

  module.generateBarCode = function(options, done)
  {
    step(
      function()
      {
        if (zintVersion[0] === 0)
        {
          exec(`"${module.config.zintExe}" --help`, {encoding: 'utf8'}, this.next());
        }
      },
      function(err, stdout)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (stdout && stdout.length)
        {
          const matches = stdout.match(/Zint version ([0-9]+)\.([0-9]+)/i);

          if (matches)
          {
            zintVersion[0] = +matches[1];
            zintVersion[1] = +matches[2];
          }
        }
      },
      function()
      {
        const cmd = [`"${module.config.zintExe}"`];

        if (zintVersion[0] === 2 && zintVersion[1] === 4)
        {
          cmd.push('--directpng');
        }
        else
        {
          cmd.push('--direct', '--filetype=PNG');
        }

        Object.keys(options || {}).forEach(k =>
        {
          const v = options[k];

          if (v === false)
          {
            return;
          }

          if (v === true)
          {
            cmd.push(`--${k}`);
          }
          else if (typeof v === 'string')
          {
            cmd.push(`--${k}="${v}"`);
          }
          else
          {
            cmd.push(`--${k}=${v}`);
          }
        });

        exec(cmd.join(' '), {encoding: 'buffer'}, this.next());
      },
      function(err, stdout, stderr)
      {
        if (err)
        {
          return done(err);
        }

        if (stderr && stderr.length)
        {
          return done(app.createError(stderr.toString(), 'ZINT_STDERR', 500));
        }

        done(null, stdout.toString('base64'));
      }
    );
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
      },
      waitUntil: 'networkidle2'
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
              {waitUntil: options.waitUntil}
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

        if (printer.special)
        {
          const matches = printer.special.match(/versalink:((?:\.?[0-9]{1,3}){4})/i);

          if (matches)
          {
            return handleDirectVersaLinkPrint(matches[1], pdfFilePath, this.next());
          }
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

  module.printZpl = (zpl, options, done) =>
  {
    const Printer = app[module.config.mongooseId].model('Printer');
    const labelFilePath = join(tmpdir(), `WMES.${Date.now()}.${Math.random()}.zpl`);

    step(
      function()
      {
        if (!options.printer)
        {
          setImmediate(this.parallel(), null, null);
        }
        else if (options.printer._id)
        {
          setImmediate(this.parallel(), null, options.printer);
        }
        else
        {
          Printer.findById(options.printer).lean().exec(this.parallel());
        }

        fs.writeFile(labelFilePath, zpl, this.parallel());
      },
      function(err, printer)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!printer)
        {
          return this.skip(app.createError(`Unknown printer: ${options.printer}`, 'PRINTER_NOT_FOUND', 400));
        }

        const line = options.line ? options.line.toUpperCase() : null;

        if (printer.special && line)
        {
          const matches = printer.special
            .split('\n')
            .map(l => l.trim().split(':'))
            .filter(l => l[0].toUpperCase() === 'LINE' && l[1].toUpperCase().split(',').includes(line))
            .shift();

          if (!matches || !/^(?:\.?[0-9]{1,3}){4}$/.test(matches[2]))
          {
            return this.skip(app.createError(`No printer for line: ${options.line}`, 'INVALID_PRINTER', 500));
          }

          const host = matches[2];
          const port = parseInt(matches[3], 10) || 9100;

          return exec(
            `"${module.config.ncatExe}" -4 --send-only -w 5 ${host} ${port} < "${labelFilePath}"`,
            this.next()
          );
        }

        if (process.platform === 'win32')
        {
          return execFile(module.config.spoolExe, [labelFilePath, printer.name], this.next());
        }

        const matches = printer.label.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)(:[0-9]+)?/);

        if (!matches)
        {
          return this.skip(app.createError(`No printer address found: ${printer.label}`, 'INVALID_PRINTER', 500));
        }

        const host = matches[1];
        const port = (matches[2] || ':9100').substring(1);

        exec(`cat "${labelFilePath}" | netcat -w 1 ${host} ${port}`, this.next());
      },
      function(err)
      {
        fs.unlink(labelFilePath, () => {});

        done(err);
      }
    );
  };

  function handleDirectVersaLinkPrint(printerIp, pdfFilePath, done)
  {
    const options = {
      url: `http://${printerIp}/UPLPRT.cmd`,
      formData: {
        DEFPRNT: '1',
        FILE: fs.createReadStream(pdfFilePath)
      }
    };

    request.post(options, (err, res, body) =>
    {
      if (err)
      {
        return done(app.createError(
          `Failed direct VersaLink print: ${err.message}`,
          'PRINT_VERSALINK_FAILURE'
        ));
      }

      if (res.statusCode !== 200)
      {
        return done(app.createError(
          `Unexpected response code to VersaLink print: ${res.statusCode}`,
          'PRINT_VERSALINK_FAILURE'
        ));
      }

      try
      {
        body = JSON.parse(body);

        if (body.result !== '0' || body.errorCode !== '0')
        {
          throw new Error();
        }
      }
      catch (err)
      {
        return done(app.createError(
          `Invalid response to VersaLink print: ${JSON.stringify(body)}`,
          'PRINT_VERSALINK_FAILURE'
        ));
      }

      done();
    });
  }
};
