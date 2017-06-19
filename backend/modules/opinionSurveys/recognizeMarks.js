// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const step = require('h5.step');

module.exports = function recognizeMarks(app, module, options, done)
{
  step(
    function execOmrStep()
    {
      const cmd = [
        JSON.stringify(module.config.omrExe),
        '--dp', options.dp || 1,
        '--min-dist', options.minDist || 60,
        '--canny', options.canny || 200,
        '--accu', options.accu || 25,
        '--min-r', options.minR || 25,
        '--max-r', options.maxR || 45,
        '--filled', options.filled || 230,
        '--marked', options.marked || 40,
        '--input', JSON.stringify(options.input),
        '--output', JSON.stringify(options.output)
      ];

      (options.regions || []).forEach(function(region)
      {
        cmd.push('--region', [region.type, region.x, region.y, region.w, region.h].join(','));
      });

      exec(cmd.join(' '), this.next());
    },
    function handleExecResultStep(err, stdout, stderr)
    {
      if (err)
      {
        err.stdout = stdout;
        err.stderr = stderr;

        return this.done(done, err);
      }
    },
    function readResultFileStep()
    {
      fs.readFile(path.join(options.output, 'result.json'), this.next());
    },
    function parseResultFileStep(err, contents)
    {
      if (err)
      {
        if (err.code === 'ENOENT')
        {
          err.message = 'Result JSON file not found.';
        }

        return this.done(done, err);
      }

      let result = null;

      try
      {
        result = JSON.parse(contents);
      }
      catch (err)
      {
        return this.done(done, new Error('Failed to parse the result JSON: ' + err.message));
      }

      return this.done(done, null, result);
    }
  );
};
