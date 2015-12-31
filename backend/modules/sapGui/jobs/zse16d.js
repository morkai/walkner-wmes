// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var checkOutputFile = require('./checkOutputFile');

module.exports = function runZse16dJob(app, sapGuiModule, job, done)
{
  var args = [
    '--output-file',
    Math.floor(Date.now() / 1000) + '@' + (job.outputFile || 'T_ZSE16D.txt'),
    '--table',
    job.table,
    '--variant',
    job.variant
  ];

  sapGuiModule.runScript(job, 'T_ZSE16D.exe', args, checkOutputFile.bind(null, done));
};
