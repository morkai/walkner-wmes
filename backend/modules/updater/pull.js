'use strict';

var exec = require('child_process').exec;

module.exports = function(options, done)
{
  exec('"' + options.gitExe + '" pull', {cwd: options.cwd, timeout: 30000}, function(err, stdout, stderr)
  {
    done(err, {stdout: stdout, stderr: stderr});
  });
};
