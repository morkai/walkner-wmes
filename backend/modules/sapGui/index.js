// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var later = require('later');
var _ = require('lodash');
var jobs = require('./jobs/index');

exports.DEFAULT_CONFIG = {
  mailSenderId: 'mail/sender',
  scriptsPath: 'C:/SAP/Scripts',
  outputPath: 'C:/SAP/Output',
  jobs: []
};

exports.start = function startSapGuiModule(app, sapGuiModule)
{
  var lastJobRunTimes = {};

  sapGuiModule.jobCount = 0;

  sapGuiModule.runJob = function(job, done)
  {
    runJob(_.cloneDeep(job), 0, done);
  };

  sapGuiModule.runScript = function(job, scriptFile, args, done)
  {
    var file = path.join(sapGuiModule.config.scriptsPath, scriptFile);
    var cp = spawn(file, args);
    var output = '';
    var timeoutTimer = !job.scriptTimeout ? null : setTimeout(
      function() { bail(new Error('SCRIPT_TIMEOUT'), null); },
      job.scriptTimeout
    );

    cp.on('error', function(err)
    {
      bail(err, null);
    });

    cp.on('exit', function(exitCode)
    {
      bail(null, exitCode);
    });

    cp.stderr.setEncoding('utf8');
    cp.stderr.on('data', function(data)
    {
      _.forEach(data.trim().split(/\r\n|\n/), function(line)
      {
        output += line + '\r\n';

        sapGuiModule.error("[%s] %s", job.id, line);
      });
    });

    cp.stdout.setEncoding('utf8');
    cp.stdout.on('data', function(data)
    {
      _.forEach(data.trim().split(/\r\n|\n/), function(line)
      {
        output += line + '\r\n';

        sapGuiModule.debug("[%s] %s", job.id, line);
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
  };

  function runJob(job, repeatCounter, done)
  {
    var startedAt = Date.now();
    var lastJobRunTime = lastJobRunTimes[job.key] || 0;

    if (startedAt - lastJobRunTime < 5000)
    {
      return sapGuiModule.warn(
        "Stopped a possible duplicate run of job [%s]. Previously run at %s.",
        job.key,
        new Date(lastJobRunTime)
      );
    }

    lastJobRunTimes[job.key] = startedAt;

    ++sapGuiModule.jobCount;

    if (typeof done !== 'function')
    {
      done = function() {};
    }

    job.id = job.name + '#' + sapGuiModule.jobCount;

    var jobDone = false;

    sapGuiModule.debug(
      "[%s] %s...",
      job.id,
      repeatCounter === 0 ? "Starting" : ("Repeating #" + repeatCounter)
    );

    jobs[job.name](app, sapGuiModule, job, function(err, exitCode, output)
    {
      if (jobDone)
      {
        return;
      }

      jobDone = true;

      var failure = !!err || exitCode !== 0;

      if (failure && isIgnoredResult(job, err, output))
      {
        failure = false;
        err = null;
        exitCode = 0;
      }

      if (err)
      {
        sapGuiModule.error("[%s] %s", job.id, err.message);
      }
      else
      {
        sapGuiModule.debug("[%s] Finished with code %s in %ds", job.id, exitCode, (Date.now() - startedAt) / 1000);
      }

      if (!job.repeatOnFailure || !failure || job.repeatOnFailure === repeatCounter)
      {
        return handleJobResult(done, job, startedAt, err, exitCode, output);
      }

      sapGuiModule.debug("[%s] Failed... will retry soon...", job.id);

      setTimeout(
        function() { runJob(job, ++repeatCounter, done); },
        Math.floor(Math.random() * 60001 + 60000)
      );
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

    done(err, exitCode, output);
  }

  function isIgnoredResult(job, err, output)
  {
    if (!Array.isArray(job.ignoredResults))
    {
      return false;
    }

    var error = err && err.message ? err.message : '';

    if (!_.isString(output))
    {
      output = '';
    }

    for (var i = 0; i < job.ignoredResults.length; ++i)
    {
      var ignoredResult = job.ignoredResults[i];

      if (_.isString(ignoredResult) && (_.includes(error, ignoredResult) || _.includes(output, ignoredResult)))
      {
        return true;
      }
      else if (_.isRegExp(ignoredResult) && (ignoredResult.test(error) || ignoredResult.test(output)))
      {
        return true;
      }
    }

    return false;
  }

  app.broker.subscribe('app.started').setLimit(1).on('message', function()
  {
    _.forEach(sapGuiModule.config.jobs, function(job, i)
    {
      if (!job.key)
      {
        job.key = job.name + '#' + i;
      }

      later.setInterval(sapGuiModule.runJob.bind(null, job), job.schedule);
    });
  });

  app.broker.subscribe('sapGui.jobDone', function(message)
  {
    if (message.result === 'success')
    {
      return;
    }

    var mailSender = app[sapGuiModule.config.mailSenderId];
    var job = message.job;

    if (!mailSender || !Array.isArray(job.failureRecipients) || !job.failureRecipients.length)
    {
      return;
    }

    var subject = '[' + app.options.id + ':sapGui:jobFailed] ' + job.id;
    var text = [
      'Job name: ' + job.name,
      'Started at: ' + new Date(message.startedAt),
      'Finished at: ' + new Date(message.finishedAt),
      'Duration: ' + ((message.finishedAt - message.startedAt) / 1000) + 's',
      'Exit code: ' + (message.exitCode === null ? 'n/a' : message.exitCode),
      'Error: ' + (message.error || 'n/a'),
      'Output:',
      message.output || 'n/a'
    ];

    mailSender.send(job.failureRecipients, subject, text.join('\r\n'), function(err)
    {
      if (err)
      {
        sapGuiModule.error("Failed to send e-mail [%s] to [%s]: %s", subject, job.failureRecipients, err.message);
      }
    });
  });
};
