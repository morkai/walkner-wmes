// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var later = require('later');
var jobs = require('./jobs/index');

exports.DEFAULT_CONFIG = {
  scriptsPath: 'C:/SAP/Scripts',
  outputPath: 'C:/SAP/Output',
  jobs: []
};

exports.start = function startSapGuiModule(app, sapGuiModule)
{
  sapGuiModule.jobCount = 0;

  sapGuiModule.runJob = function(jobName, done)
  {
    ++sapGuiModule.jobCount;

    var startedAt = Date.now();
    var jobId = jobName + '#' + sapGuiModule.jobCount;
    var jobDone = false;

    sapGuiModule.debug("[%s] Starting...", jobId);

    jobs[jobName](app, sapGuiModule, jobId, function(err, exitCode)
    {
      if (jobDone)
      {
        return;
      }

      jobDone = true;

      if (err)
      {
        sapGuiModule.error("[%s] %s", jobId, err.message);
      }
      else
      {
        sapGuiModule.debug("[%s] Finished with code %d in %ds", jobId, exitCode, (Date.now() - startedAt) / 1000);
      }

      if (typeof done === 'function')
      {
        done(err, exitCode);
      }
    });
  };

  sapGuiModule.runScript = function(jobId, scriptFile, args, done)
  {
    var file = path.join(sapGuiModule.config.scriptsPath, scriptFile);
    var cp = spawn(file, args);

    cp.on('error', done);

    cp.on('exit', function(exitCode)
    {
      done(null, exitCode);
    });

    cp.stderr.setEncoding('utf8');
    cp.stderr.on('data', function(data)
    {
      data.trim().split(/\r\n|\n/).forEach(function(line)
      {
        sapGuiModule.error("[%s] %s", jobId, line);
      });
    });

    cp.stdout.setEncoding('utf8');
    cp.stdout.on('data', function(data)
    {
      data.trim().split(/\r\n|\n/).forEach(function(line)
      {
        sapGuiModule.debug("[%s] %s", jobId, line);
      });
    });
  };

  sapGuiModule.config.jobs.forEach(function(job)
  {
    later.setInterval(sapGuiModule.runJob.bind(null, job.name), job.schedule);
  });
};
