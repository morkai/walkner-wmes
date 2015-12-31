// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var fs = require('fs');

module.exports = function checkOutputFile(done, err, exitCode, output)
{
  if (err || exitCode !== 0)
  {
    return done(err, exitCode, output);
  }

  var outputPath = null;
  var outputFile = null;
  var matches;

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

  fs.exists(path.join(outputPath, outputFile), function(exists)
  {
    done(exists ? null : new Error('MISSING_OUTPUT_FILE'), exitCode, output);
  });
};
