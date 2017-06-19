// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const checkOutputFile = require('./checkOutputFile');

module.exports = function runGenericListJob(app, sapGuiModule, job, done)
{
  const args = [
    '--output-file',
    Math.floor(Date.now() / 1000) + '@' + (job.outputFile || 'T_GENERIC_LIST.txt'),
    '--transaction',
    job.transaction,
    '--variant',
    job.variant
  ];

  sapGuiModule.runScript(job, 'T_GENERIC_LIST.exe', args, checkOutputFile.bind(null, done));
};
