// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const step = require('h5.step');
const ejs = require('ejs');

const renderKk = ejs.compile(fs.readFileSync(`${__dirname}/../templates/kk.ejs`, 'utf8'), {
  cache: true,
  filename: `${__dirname}/../templates/kk.ejs`,
  compileDebug: false,
  rmWhitespace: true
});

module.exports = function startPrintJobRoute(app, module, req, res, next)
{
  if (module.printing)
  {
    return next(app.createError('Printing already in progress.', 'IN_PROGRESS', 400));
  }

  const html2pdf = app[module.config.html2pdfId];
  const mongoose = app[module.config.mongooseId];
  const Printer = mongoose.model('Printer');
  const KanbanPrintQueue = mongoose.model('KanbanPrintQueue');

  const {queue, job} = req.body;

  module.printing = {queue, job};

  app.broker.publish('kanban.printQueues.started', module.printing);

  step(
    function()
    {
      KanbanPrintQueue.findById({_id: queue}).lean().exec(this.next());
    },
    function(err, queue)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!queue)
      {
        return this.skip(app.createError(`Print queue not found: ${queue}`, 'QUEUE_NOT_FOUND', 400));
      }

      this.jobIndex = queue.jobs.findIndex(j => j._id === job);

      if (this.jobIndex === -1)
      {
        return this.skip(app.createError(`Print job not found: ${job}`, 'JOB_NOT_FOUND', 400));
      }

      this.queue = queue;
      this.job = queue.jobs[this.jobIndex];
      this.startedAt = new Date();

      const $set = {
        [`jobs.${this.jobIndex}.status`]: 'printing',
        [`jobs.${this.jobIndex}.startedAt`]: this.startedAt
      };

      KanbanPrintQueue.collection.update({_id: this.queue._id}, {$set}, this.next());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(app.createError(
          `Failed to change job status to printing: ${err.message}`,
          'JOB_UPDATE_FAILURE',
          500
        ));
      }

      app.broker.publish('kanban.printQueues.updated', {
        queue: {
          _id: this.queue._id
        },
        job: {
          _id: this.job._id,
          status: 'printing',
          startedAt: this.startedAt
        }
      });

      Printer.find({tags: /^kanban/}).lean().exec(this.next());
    },
    function(err, printers)
    {
      if (err)
      {
        return this.skip(app.createError(`Failed to find printers: ${err.message}`, 'PRINTER_FIND_FAILURE', 500));
      }

      this.printers = {};

      printers.forEach(printer =>
      {
        printer.tags.forEach(tag =>
        {
          if (!tag.startsWith('kanban'))
          {
            return;
          }

          const layout = tag.replace('kanban/', '');

          if (!this.job.layouts.includes(layout))
          {
            return;
          }

          this.printers[layout] = printer._id;
        });
      });

      for (const layout of this.job.layouts)
      {
        if (!this.printers[layout])
        {
          return this.skip(app.createError(`No printer for layout: ${layout}`, 'PRINTER_NOT_FOUND', 500));
        }
      }
    },
    function()
    {
      if (this.printers.kk)
      {
        printKk(this.printers.kk, this.job, this.group());
      }

      if (this.printers.desc)
      {
        printDesc(this.printers.desc, this.job, this.group());
      }

      if (this.printers.empty || this.printers.full || this.printers.wh)
      {
        printEmptyFullWh(this.printers, this.job, this.group());
      }
    },
    function(err)
    {
      finalize(err, this.queue, this.job, this.jobIndex);
    }
  );

  function finalize(printError, queue, job, jobIndex)
  {
    step(
      function()
      {
        job.status = printError ? 'failure' : 'success';
        job.finishedAt = new Date();

        this.message = {
          queue: {
            _id: queue._id
          },
          job: {
            _id: job._id,
            status: job.status,
            finishedAt: job.finishedAt
          }
        };

        const $set = {
          [`jobs.${jobIndex}.status`]: job.status,
          [`jobs.${jobIndex}.finishedAt`]: job.finishedAt
        };

        KanbanPrintQueue.collection.update({_id: queue._id}, {$set}, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to finalize job status: ${err.message}`,
            'JOB_UPDATE_FAILURE',
            500
          ));
        }

        const completed = queue.jobs.every(job => job.status === 'ignored' || job.status === 'success');

        if (completed)
        {
          this.message.queue.todo = false;

          KanbanPrintQueue.collection.update({_id: queue._id}, {$set: {todo: false}}, this.next());
        }
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to complete print queue: ${err.message}`,
            'QUEUE_UPDATE_FAILURE',
            500
          ));
        }
      },
      function(err)
      {
        if (printError || err)
        {
          next(printError || err);
        }
        else
        {
          res.sendStatus(204);
        }

        app.broker.publish('kanban.printQueues.updated', this.message);
        app.broker.publish('kanban.printQueues.finished', module.printing);

        module.printing = null;
      }
    );
  }

  function printKk(printer, job, done)
  {
    const pages = [];
    const kanbans = [].concat(job.kanbans);

    job.data.workstations.forEach((workstation, i) =>
    {
      const location = job.data.locations[i] || '???';
      const kanbanCount = workstation * 2;

      for (let w = 0; w < kanbanCount; ++w)
      {
        const kanbanId = kanbans.shift() || '0';

        pages.push({
          line: job.line,
          workstation: `0${i + 1}`,
          location,
          nc12: job.data.nc12,
          description: job.data.description,
          family: job.data.family,
          storageBin: job.data.storageBin,
          componentQty: job.data.componentQty,
          supplyArea: job.data.supplyArea,
          barCodes: {
            empty: {
              barcode: 20,
              notext: false,
              height: 82,
              data: `${kanbanId}2`
            },
            full: {
              barcode: 20,
              notext: false,
              height: 82,
              data: `${kanbanId}5`
            },
            wh: {
              barcode: 58,
              notext: true,
              scale: 2.5,
              data: [job.data.nc12, job.data.componentQty, job.data.storageBin, job.line, job.data.supplyArea].join('/')
            }
          }
        });
      }
    });

    step(
      function()
      {
        generateBarCodes(pages.map(page => page.barCodes), this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to generate bar codes: ${err.message}`, 'PRINT_FAILURE', 500));
        }

        html2pdf.generatePdf(
          renderKk({pages}),
          {waitUntil: 'load', orientation: 'landscape'},
          this.next()
        );
      },
      function(err, result)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to generate PDF: ${err.message}`, 'PRINT_FAILURE', 500));
        }

        html2pdf.printPdf(result.hash, printer, '', this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to print PDF: ${err.message}`, 'PRINT_FAILURE', 500));
        }
      },
      done
    );
  }

  function printDesc(printer, job, done)
  {
    step(
      function()
      {
        fs.readFile(`${__dirname}/../templates/desc.prn`, 'utf8', this.next());
      },
      function(err, template)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to read desc.prn template: ${err.message}`, 'PRINT_FAILURE', 500));
        }

        template = compileZpl(template, job, '0', '??', '???');

        html2pdf.printZpl(
          job.kanbans.map(() => template).join('\r\n'),
          printer,
          this.next()
        );
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to print desc ZPL: ${err.message}`, 'PRINT_FAILURE', 500));
        }
      },
      done
    );
  }

  function printEmptyFullWh(printers, job, done)
  {
    const queues = {};
    const layouts = ['empty', 'full', 'wh'];

    layouts.forEach(layout =>
    {
      const printerId = printers[layout];

      if (printerId)
      {
        if (!queues[printerId])
        {
          queues[printerId] = [];
        }

        queues[layout] = queues[printerId];
      }
    });

    step(
      function()
      {
        layouts.forEach(layout =>
        {
          if (printers[layout])
          {
            fs.readFile(`${__dirname}/../templates/${layout}.prn`, 'utf8', this.parallel());
          }
          else
          {
            setImmediate(this.parallel(), null, null);
          }
        });
      },
      function(err, emptyTemplate, fullTemplate, whTemplate)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to read template: ${err.message}`, 'PRINT_FAILURE', 500));
        }

        const kanbans = [].concat(job.kanbans);

        job.data.workstations.forEach((workstations, i) =>
        {
          const kanbanCount = workstations * 2;
          const workstation = `0${i + 1}`;
          const location = job.data.locations[i] || '???';

          for (let w = 0; w < kanbanCount; ++w)
          {
            const kanbanId = kanbans.shift() || '0';

            if (emptyTemplate)
            {
              queues.empty.push(compileZpl(emptyTemplate, job, kanbanId, workstation, location));
            }

            if (fullTemplate)
            {
              queues.full.push(compileZpl(fullTemplate, job, kanbanId, workstation, location));
            }

            if (whTemplate)
            {
              queues.wh.push(compileZpl(whTemplate, job, kanbanId, workstation, location));
            }
          }
        });

        setImmediate(this.next());
      },
      function()
      {
        ['empty', 'full', 'wh'].forEach(layout =>
        {
          const printerId = printers[layout];

          if (printerId)
          {
            printNextZplBatch(printerId, queues[printerId], this.group());
          }
        });
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to print empty/full/wh ZPL: ${err.message}`, 'PRINT_FAILURE', 500));
        }
      },
      done
    );
  }

  function printNextZplBatch(printer, remaining, done)
  {
    if (remaining.length === 0)
    {
      return done();
    }

    const zpl = remaining.splice(0, 10);

    html2pdf.printZpl(zpl.join('\r\n'), printer, err =>
    {
      if (err)
      {
        return done(err);
      }

      setTimeout(printNextZplBatch, zpl.length * 250, printer, remaining, done);
    });
  }

  function compileZpl(zpl, job, kanbanId, workstation, location)
  {
    const templateData = {
      DLE: '\u0010',
      NC12: job.data.nc12,
      DESCRIPTION: e(job.data.description),
      KANBAN_ID: kanbanId,
      FAMILY: e(job.data.family),
      LINE: e(job.line),
      SUPPLY_AREA: e(job.data.supplyArea),
      STORAGE_BIN: e(job.data.storageBin),
      WORKSTATION: workstation,
      LOCATION: location,
      COMPONENT_QTY: job.data.componentQty
    };

    Object.keys(templateData).forEach(key =>
    {
      zpl = zpl.replace(new RegExp('\\$\\{' + key + '\\}', 'g'), templateData[key]);
    });

    return zpl;
  }

  function e(v)
  {
    return (v || '').replace('~', '\\7e');
  }

  function generateBarCodes(queue, done)
  {
    if (!queue.length)
    {
      return done();
    }

    const barCodes = queue.shift();
    const keys = Object.keys(barCodes);

    step(
      function()
      {
        keys.forEach(key =>
        {
          html2pdf.generateBarCode(barCodes[key], this.group());
        });
      },
      function(err, images)
      {
        if (err)
        {
          return done(err);
        }

        keys.forEach((key, i) =>
        {
          barCodes[key] = images[i];
        });

        setImmediate(generateBarCodes, queue, done);
      }
    );
  }
};
