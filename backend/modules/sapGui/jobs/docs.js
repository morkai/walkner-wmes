// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const os = require('os');
const path = require('path');
const {URL} = require('url');
const fs = require('fs-extra');
const step = require('h5.step');
const request = require('request');
const moment = require('moment');
const checkOutputFile = require('./checkOutputFile');

let inProgress = false;

module.exports = function runDocsJob(app, sapGuiModule, job, done)
{
  if (inProgress)
  {
    return setImmediate(done, app.createError('Job already running.', 'IN_PROGRESS', 400));
  }

  inProgress = true;

  const planUrl = new URL(job.planBaseUrl);
  const planQueue = [moment()];

  if (planQueue[0].hours() < 6)
  {
    planQueue[0].subtract(1, 'days');
  }

  planQueue[0].startOf('day');

  runNext((err, exitCode, output) =>
  {
    inProgress = false;

    done(err, exitCode, output);
  });

  function runNext(done)
  {
    let planDate = planQueue.shift();

    if (!planDate)
    {
      return done(null, 0, 'OK');
    }

    planUrl.search = 'select(orders._id,orders.mrp)&pceTimes=0';

    if (typeof planDate !== 'string')
    {
      planDate = planDate.format('YYYY-MM-DD');
      planUrl.search += '&minMaxDates=1';
    }

    planUrl.pathname = `/planning/plans/${planDate}`;

    sapGuiModule.debug(`[${job.id}] [${planDate}] Started...`);

    step(
      function()
      {
        const options = {
          method: 'GET',
          url: planUrl.toString(),
          json: true
        };

        request(options, this.next());
      },
      function(err, res, plan)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to fetch plan ${planDate}: ${err.message}`, 'FETCH_PLAN_FAILURE'));
        }

        if (res.statusCode !== 200)
        {
          return this.skip(app.createError(
            `Failed to fetch plan ${planDate}: expected status code 200, got ${res.statusCode}`,
            'FETCH_PLAN_FAILURE'
          ));
        }

        if (!plan)
        {
          return this.skip();
        }

        if (plan.maxDate)
        {
          const nextDate = moment(planDate, 'YYYY-MM-DD');

          while (nextDate.format('YYYY-MM-DD') !== plan.maxDate)
          {
            planQueue.push(nextDate.add(1, 'days').format('YYYY-MM-DD'));
          }
        }

        const excludedMrps = job.excludedMrps || [];
        const orders = plan.orders
          .filter(o => excludedMrps.length === 0 || !excludedMrps.includes(o.mrp))
          .map(o => o._id);

        sapGuiModule.debug(`[${job.id}] [${planDate}] ${orders.length} orders`);

        if (!orders.length)
        {
          return this.skip();
        }

        this.inputDir = os.tmpdir();
        this.inputFile = `WMES_DOCS_ORDERS_${planDate}.txt`;
        this.inputPath = path.join(this.inputDir, this.inputFile);

        fs.writeFile(this.inputPath, orders.join('\r\n'), this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to write orders input file for ${planDate}: ${err.message}`,
            'INPUT_FILE_FAILURE'
          ));
        }

        const args = [
          '--input-path',
          this.inputDir,
          '--input-file',
          this.inputFile,
          '--output-file',
          Math.floor(Date.now() / 1000) + '@' + (job.outputFile || 'T_DOCS.txt')
        ];

        sapGuiModule.runScript(job, 'T_DOCS.exe', args, checkOutputFile.bind(null, this.next()));
      },
      function(err, exitCode, output)
      {
        if (this.inputPath)
        {
          fs.unlink(this.inputPath, () => {});
        }

        if (err)
        {
          sapGuiModule.error(`[${job.id}] [${planDate}] ${err.message}`);

          if (planQueue.length === 0)
          {
            return done(err, exitCode, output);
          }
        }
        else
        {
          sapGuiModule.debug(`[${job.id}] [${planDate}] OK!`);
        }


        setImmediate(runNext, done);
      }
    );
  }
};
