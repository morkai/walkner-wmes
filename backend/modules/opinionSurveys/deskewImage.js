// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var spawn = require('child_process').spawn;
var _ = require('lodash');

module.exports = function deskewImage(app, module, inputFile, outputFile, done)
{
  var complete = _.once(done);
  var args = [
    '-a', '15',
    '-b', '000000',
    '-o', outputFile,
    inputFile
  ];
  var p = spawn(module.config.deskewExe, args);
  var buffer = '';

  p.stderr.setEncoding('utf8');
  p.stderr.on('data', function(data) { buffer += data; });

  p.on('error', complete);
  p.on('exit', function(code)
  {
    var err = code ? new Error("deskew exit with code: " + code + "\n" + buffer.trim()) : null;

    complete(err, outputFile);
  });
};
