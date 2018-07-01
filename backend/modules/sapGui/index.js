// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {spawn} = require('child_process');
const {join} = require('path');
const {URL} = require('url');
const _ = require('lodash');
const later = require('later');
const request = require('request');
const jobs = require('./jobs');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  mailSenderId: 'mail/sender',
  scriptsPath: 'C:/SAP/Scripts',
  outputPath: 'C:/SAP/Output',
  jobs: [],
  remoteUrl: null,
  secretKey: null
};

exports.start = function startSapGuiModule(app, module)
{
  const lastJobRunTimes = {};

  module.jobCount = 0;

  module.runJob = (job, done) =>
  {
    if (!module.config.scriptsPath)
    {
      return done(app.createError('Scripts are disabled.', 'DISABLED', 500));
    }

    runJob(_.cloneDeep(job), 0, done);
  };

  module.runRemoteJob = (job, done) =>
  {
    if (!module.config.remoteUrl)
    {
      return done(app.createError('Remote jobs are disabled.', 'DISABLED', 500));
    }

    runRemoteJob(_.cloneDeep(job), done);
  };

  module.runScript = runScript;

  app.onModuleReady(
    [
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.broker.subscribe('app.started', setUpJobs).setLimit(1);

  app.broker.subscribe('sapGui.jobDone', notifyAboutFailedJob);

  function runScript(job, scriptFile, args, done)
  {
    if (!module.config.scriptsPath)
    {
      return done(app.createError('Scripts are disabled.', 'DISABLED', 500));
    }

    const file = join(module.config.scriptsPath, scriptFile);
    let cp = spawn(file, args);
    let output = '';
    let timeoutTimer = !job.scriptTimeout ? null : setTimeout(
      () => bail(new Error('SCRIPT_TIMEOUT'), null),
      job.scriptTimeout
    );

    cp.on('error', err => bail(err, null));

    cp.on('exit', exitCode => bail(null, exitCode));

    cp.stderr.setEncoding('utf8');
    cp.stderr.on('data', function(data)
    {
      data.trim().split(/\r\n|\n/).forEach(line =>
      {
        output += line + '\r\n';

        module.error('[%s] %s', job.id, line);
      });
    });

    cp.stdout.setEncoding('utf8');
    cp.stdout.on('data', data =>
    {
      data.trim().split(/\r\n|\n/).forEach(line =>
      {
        output += line + '\r\n';

        module.debug('[%s] %s', job.id, line);
      });
    });

    function bail(err, exitCode)
    {
      done(err, exitCode, output);

      if (cp !== null)
      {
        cp.removeAllListeners();
        cp.kill();
        cp = null;
      }

      if (timeoutTimer !== null)
      {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
    }
  }

  function runJob(job, repeatCounter, done)
  {
    if (typeof done !== 'function')
    {
      done = () => {};
    }

    if (!job || !jobs[job.name])
    {
      return done(app.createError('Unknown job.', 'INPUT', 400));
    }

    const startedAt = Date.now();

    if (!job.key)
    {
      job.key = `${job.name}#${startedAt}`;
    }

    const lastJobRunTime = lastJobRunTimes[job.key] || 0;

    if (startedAt - lastJobRunTime < 5000)
    {
      module.warn(
        'Stopped a possible duplicate run of job [%s]. Previously run at %s.',
        job.key,
        new Date(lastJobRunTime)
      );

      return done(app.createError('Duplicate job', 'DUPLICATE', 500));
    }

    lastJobRunTimes[job.key] = startedAt;

    ++module.jobCount;

    job.id = job.name + '#' + module.jobCount;

    if (job.key !== job.name)
    {
      job.id = job.key + ':' + job.id;
    }

    let jobDone = false;

    module.debug(
      '[%s] %s...',
      job.id,
      repeatCounter === 0 ? 'Starting' : ('Repeating #' + repeatCounter)
    );

    if (repeatCounter === 0 && job.waitForResult === false)
    {
      done();
    }

    jobs[job.name](app, module, job, (err, exitCode, output) =>
    {
      if (jobDone)
      {
        return;
      }

      jobDone = true;

      let failure = !!err || exitCode !== 0;

      if (isIgnoredResult(job, err, output))
      {
        failure = false;
        err = null;
        exitCode = 0;
      }
      else if (isExpectedResult(job, err, output))
      {
        failure = false;
        err = null;
        exitCode = 0;
      }
      else if (!failure)
      {
        failure = true;
        err = new Error('Unexpected result.');
      }

      if (err)
      {
        module.error('[%s] %s', job.id, err.message);
      }
      else
      {
        module.debug('[%s] Finished with code %s in %ds', job.id, exitCode, (Date.now() - startedAt) / 1000);
      }

      if (!job.repeatOnFailure || !failure || job.repeatOnFailure === repeatCounter)
      {
        return handleJobResult(done, job, startedAt, err, exitCode, output);
      }

      module.debug('[%s] Failed... will retry soon...', job.id);

      setTimeout(
        () => runJob(job, ++repeatCounter, done),
        Math.floor(Math.random() * 60001 + 60000)
      );
    });
  }

  function runRemoteJob(job, done)
  {
    const req = {
      method: 'POST',
      url: Object.assign(new URL(module.config.remoteUrl), {pathname: '/sapGui/jobs;run'}).toString(),
      json: true,
      body: {
        secretKey: module.config.secretKey,
        job
      },
      timeout: 60000 + (job.scriptTimeout || 0)
    };

    request(req, (err, res, body) =>
    {
      if (err)
      {
        return done(err);
      }

      if (res.statusCode !== 200 && res.statusCode !== 204)
      {
        return done(app.createError(
          `Unexpected response status code: ${res.statusCode}`,
          'UNEXPECTED_STATUS_CODE',
          500
        ));
      }

      done(null, body);
    });
  }

  function handleJobResult(done, job, startedAt, err, exitCode, output)
  {
    app.broker.publish('sapGui.jobDone', {
      job: job,
      result: err || exitCode ? 'failure' : 'success',
      startedAt: startedAt,
      finishedAt: Date.now(),
      output: output || '',
      error: err ? err.message : null,
      exitCode: typeof exitCode === 'number' ? exitCode : null
    });

    if (job.waitForResult !== false)
    {
      done(err, exitCode, output);
    }
  }

  function isIgnoredResult(job, err, output)
  {
    return isMatchingResult('ignoredResults', false, job, err, output);
  }

  function isExpectedResult(job, err, output)
  {
    return isMatchingResult('expectedResults', true, job, err, output);
  }

  function isMatchingResult(filterType, defaultResult, job, err, output)
  {
    const patterns = job[filterType];

    if (!Array.isArray(patterns))
    {
      return defaultResult;
    }

    const error = err && err.message ? err.message : '';

    if (!_.isString(output))
    {
      output = '';
    }

    for (let i = 0; i < patterns.length; ++i)
    {
      const pattern = patterns[i];

      if (_.isString(pattern) && (_.includes(error, pattern) || _.includes(output, pattern)))
      {
        return true;
      }
      else if (_.isRegExp(pattern) && (pattern.test(error) || pattern.test(output)))
      {
        return true;
      }
    }

    return false;
  }

  function setUpJobs()
  {
    module.config.jobs.forEach((job, i) =>
    {
      if (!job.key)
      {
        job.key = job.name + '#' + i;
      }

      later.setInterval(module.runJob.bind(null, job), job.schedule);
    });
  }

  function notifyAboutFailedJob(message)
  {
    if (message.result === 'success')
    {
      return;
    }

    const mailSender = app[module.config.mailSenderId];
    const job = message.job;

    if (!mailSender || !Array.isArray(job.failureRecipients) || !job.failureRecipients.length)
    {
      return;
    }

    const subject = `[${app.options.id}:sapGui:jobFailed] ${job.id}`;
    const text = [
      'Job name: ' + job.name,
      'Started at: ' + new Date(message.startedAt),
      'Finished at: ' + new Date(message.finishedAt),
      'Duration: ' + ((message.finishedAt - message.startedAt) / 1000) + 's',
      'Exit code: ' + (message.exitCode === null ? 'n/a' : message.exitCode),
      'Error: ' + (message.error || 'n/a'),
      'Output:',
      _.isPlainObject(message.output) ? JSON.stringify(message.output, null, 2) : (message.output || 'n/a')
    ];

    mailSender.send(job.failureRecipients, subject, text.join('\r\n'), err =>
    {
      if (err)
      {
        module.error('Failed to send e-mail [%s] to [%s]: %s', subject, job.failureRecipients, err.message);
      }
    });
  }
};
