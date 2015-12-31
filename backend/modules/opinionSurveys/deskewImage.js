// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
