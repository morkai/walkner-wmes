// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var later = require('later');
var jobs = require('./jobs/index');

exports.DEFAULT_CONFIG = {
  mailSenderId: 'mail/sender',
  scriptsPath: 'C:/SAP/Scripts',
  outputPath: 'C:/SAP/Output',
  jobs: []
};

exports.start = function startSapGuiModule(app, sapGuiModule)
{
  sapGuiModule.jobCount = 0;

  sapGuiModule.runJob = function(job, done)
  {
    runJob(job, 0, done);
  };

  sapGuiModule.runScript = function(jobId, scriptFile, args, done)
  {
    var file = path.join(sapGuiModule.config.scriptsPath, scriptFile);
    var cp = spawn(file, args);
    var output = '';

    cp.on('error', function(err)
    {
      done(err, null, output);
    });

    cp.on('exit', function(exitCode)
    {
      done(null, exitCode, output);
    });

    cp.stderr.setEncoding('utf8');
    cp.stderr.on('data', function(data)
    {
      data.trim().split(/\r\n|\n/).forEach(function(line)
      {
        output += line + '\r\n';

        sapGuiModule.error("[%s] %s", jobId, line);
      });
    });

    cp.stdout.setEncoding('utf8');
    cp.stdout.on('data', function(data)
    {
      data.trim().split(/\r\n|\n/).forEach(function(line)
      {
        output += line + '\r\n';

        sapGuiModule.debug("[%s] %s", jobId, line);
      });
    });
  };

  function runJob(job, repeatCounter, done)
  {
    ++sapGuiModule.jobCount;

    if (typeof done !== 'function')
    {
      done = function() {};
    }

    var startedAt = Date.now();
    var jobId = job.name + '#' + sapGuiModule.jobCount;
    var jobDone = false;

    sapGuiModule.debug(
      "[%s] %s...",
      jobId,
      repeatCounter === 0 ? "Starting..." : ("Repeating #" + repeatCounter + "...")
    );

    jobs[job.name](app, sapGuiModule, jobId, function(err, exitCode, output)
    {
      if (jobDone)
      {
        return;
      }

      jobDone = true;

      var failure = !!err || exitCode !== 0;

      if (err)
      {
        sapGuiModule.error("[%s] %s", jobId, err.message);
      }
      else
      {
        sapGuiModule.debug("[%s] Finished with code %s in %ds", jobId, exitCode, (Date.now() - startedAt) / 1000);
      }

      if (!job.repeatOnFailure || !failure || job.repeatOnFailure === repeatCounter)
      {
        return handleJobResult(done, job, jobId, startedAt, err, exitCode, output);
      }

      sapGuiModule.debug("Failed... will retry soon...");

      setTimeout(
        function() { runJob(job, ++repeatCounter, done); },
        Math.floor(Math.random() * 60001 + 60000)
      );
    });
  }

  function handleJobResult(done, job, jobId, startedAt, err, exitCode, output)
  {
    app.broker.publish('sapGui.jobDone', {
      id: jobId,
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

  app.broker.subscribe('app.started').setLimit(1).on('message', function()
  {
    sapGuiModule.config.jobs.forEach(function(job)
    {
      later.setInterval(sapGuiModule.runJob.bind(null, job), job.schedule);
    });
  });

  app.broker.subscribe('sapGui.jobDone', function(message)
  {
    var mailSender = app[sapGuiModule.config.mailSenderId];
    var job = message.job;

    if (!mailSender || !Array.isArray(job.failureRecipients) || !job.failureRecipients.length)
    {
      return;
    }

    var subject = '[' + app.options.id + ':sapGui:jobFailed] ' + message.id;
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
