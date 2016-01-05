// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var format = require('util').format;
var exec = require('child_process').exec;
var _ = require('lodash');

module.exports = function runZlf1Job(app, sapGuiModule, job, done)
{
  sapGuiModule.runScript(job, 'T_ZLF1.exe', [], function(err, exitCode, output)
  {
    if (_.includes(output, 'bytes transmitted')
      && !_.isEmpty(job.sourceDestination)
      && !_.isEmpty(job.targetDestination))
    {
      var cmd = format('MOVE /Y "%s" "%s"', job.sourceDestination, job.targetDestination);

      exec(cmd, function(err, stdout, stderr)
      {
        done(err, exitCode, format("%s\r\nMOVE (stdout):\r\n%s\r\nMOVE (stderr):\r\n", output, stdout, stderr));
      });
    }
    else
    {
      done(err, exitCode, output);
    }
  });
};
