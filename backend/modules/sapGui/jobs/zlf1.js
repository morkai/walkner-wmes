// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var format = require('util').format;
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var step = require('h5.step');

module.exports = function runZlf1Job(app, sapGuiModule, job, done)
{
  step(
    function()
    {
      sapGuiModule.runScript(job, 'T_ZLF1.exe', [], this.next());
    },
    function(err, exitCode, output)
    {
      this.err = err;
      this.exitCode = exitCode;
      this.output = output;

      if (!_.includes(output, 'bytes transmitted')
        || _.isEmpty(job.sourceDestination)
        || _.isEmpty(job.targetDestination))
      {
        return this.skip();
      }

      fs.readdir(job.sourceDestination.replace('*', ''), this.next());
    },
    function(err, files)
    {
      if (err)
      {
        return sapGuiModule.error("[zlf1] Failed to readdir: %s", err.message);
      }

      if (_.isEmpty(files))
      {
        return;
      }

      var orderDatFiles = files.filter(function(file) { return /^[0-9]{9}\.(DAT|TXT)$/i.test(file); });
      var sourceDestination = job.sourceDestination.replace('*', '');

      for (var i = 0; i < orderDatFiles.length; ++i)
      {
        parseOrderDatFile(path.join(sourceDestination, orderDatFiles[i]), this.group());
      }
    },
    function(err, orders)
    {
      if (err)
      {
        return sapGuiModule.error("Failed to parse orders DAT files: %s", err.message);
      }

      if (_.isEmpty(orders))
      {
        return;
      }

      var filePath = path.join(job.outputPath, Math.floor(Date.now() / 1000) + '@' + job.outputFile);
      var fileContents = JSON.stringify(orders);

      fs.writeFile(filePath, fileContents, this.next());
    },
    function(err)
    {
      if (err)
      {
        sapGuiModule.error("[zlf1] Failed to write orders JSON file: %s", err.message);
      }

      var cmd = format('MOVE /Y "%s" "%s"', job.sourceDestination, job.targetDestination);
      var output = this.output;

      exec(cmd, function(err, stdout, stderr)
      {
        done(err, format("%s\r\nMOVE (stdout):\r\n%s\r\nMOVE (stderr):\r\n", output, stdout, stderr));
      });
    },
    function(err, output)
    {
      done(err || this.err, this.exitCode || 0, output || this.output);
    }
  );
};

function parseOrderDatFile(filePath, done)
{
  fs.readFile(filePath, 'utf8', function(err, fileContents)
  {
    if (err)
    {
      return done(err);
    }

    var orderData = {};

    fileContents.split('\n').map(function(line)
    {
      var parts = line.trim().split(':');
      var key = parts.shift().trim().toLowerCase().replace(/\s+/g, '_');
      var value = parts.join(':').trim();

      orderData[key] = value;
    });

    done(null, orderData);
  });
}
