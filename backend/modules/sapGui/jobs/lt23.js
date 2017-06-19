// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var checkOutputFile = require('./checkOutputFile');

module.exports = function runLt23Job(app, sapGuiModule, job, done)
{
  var args = [
    '--output-file',
    Math.floor(Date.now() / 1000) + '@' + (job.outputFile || 'T_LT23.txt')
  ];

  sapGuiModule.runScript(job, 'T_LT23.exe', args, checkOutputFile.bind(null, done));
};
