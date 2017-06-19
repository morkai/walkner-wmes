// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const spawn = require('child_process').spawn;
const _ = require('lodash');

module.exports = function deskewImage(app, module, inputFile, outputFile, done)
{
  const complete = _.once(done);
  const args = [
    '-a', '15',
    '-b', '000000',
    '-o', outputFile,
    inputFile
  ];
  const p = spawn(module.config.deskewExe, args);
  let buffer = '';

  p.stderr.setEncoding('utf8');
  p.stderr.on('data', function(data) { buffer += data; });

  p.on('error', complete);
  p.on('exit', function(code)
  {
    const err = code ? new Error('deskew exit with code: ' + code + '\n' + buffer.trim()) : null;

    complete(err, outputFile);
  });
};
