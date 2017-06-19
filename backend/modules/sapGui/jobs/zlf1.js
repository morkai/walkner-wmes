// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const format = require('util').format;
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');

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
      this.empty = _.includes(output, 'No order numbers');

      if (this.empty)
      {
        return;
      }

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
        return sapGuiModule.error('[zlf1] Failed to readdir: %s', err.message);
      }

      if (_.isEmpty(files))
      {
        return;
      }

      const orderDatFiles = files.filter(function(file) { return /^[0-9]{9}\.(DAT|TXT)$/i.test(file); });
      const sourceDestination = job.sourceDestination.replace('*', '');

      for (let i = 0; i < orderDatFiles.length; ++i)
      {
        parseOrderDatFile(path.join(sourceDestination, orderDatFiles[i]), this.group());
      }
    },
    function(err, orders)
    {
      if (err)
      {
        return sapGuiModule.error('Failed to parse orders DAT files: %s', err.message);
      }

      const filePath = path.join(job.outputPath, Math.floor(Date.now() / 1000) + '@' + job.outputFile);
      const fileContents = JSON.stringify(orders || []);

      fs.writeFile(filePath, fileContents, this.next());
    },
    function(err)
    {
      if (err)
      {
        sapGuiModule.error('[zlf1] Failed to write orders JSON file: %s', err.message);
      }

      if (this.empty)
      {
        return;
      }

      const cmd = format('MOVE /Y "%s" "%s"', job.sourceDestination, job.targetDestination);
      const output = this.output;

      exec(cmd, function(err, stdout, stderr)
      {
        done(err, format('%s\r\nMOVE (stdout):\r\n%s\r\nMOVE (stderr):\r\n', output, stdout, stderr));
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

    const orderData = {};

    fileContents.split('\n').map(function(line)
    {
      const parts = line.trim().split(':');
      const key = parts.shift().trim().toLowerCase().replace(/\s+/g, '_');
      const value = parts.join(':').trim();

      orderData[key] = value;
    });

    done(null, orderData);
  });
}
