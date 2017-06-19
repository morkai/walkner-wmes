// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs-extra');

module.exports = function checkOutputFile(done, err, exitCode, output)
{
  if (err || exitCode !== 0)
  {
    return done(err, exitCode, output);
  }

  let outputPath = null;
  let outputFile = null;
  let matches;

  matches = output.match(/--output-path=(.*?)$/m);

  if (matches !== null)
  {
    outputPath = matches[1];
  }

  matches = output.match(/--output-file=(.*?)$/m);

  if (matches !== null)
  {
    outputFile = matches[1];
  }

  if (outputPath === null || outputFile === null)
  {
    return done(new Error('NO_OUTPUT_FILE_PATH'), null, output);
  }

  fs.pathExists(path.join(outputPath, outputFile), function(err, exists)
  {
    done(exists ? null : new Error('MISSING_OUTPUT_FILE'), exitCode, output);
  });
};
