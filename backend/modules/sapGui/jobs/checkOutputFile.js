// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
