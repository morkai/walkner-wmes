// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const checkOutputFile = require('./checkOutputFile');

module.exports = function runZoppJob(app, sapGuiModule, job, done)
{
  const args = [
    '--output-file',
    Math.floor(Date.now() / 1000) + '@' + (job.outputFile || 'T_ZOPP.txt')
  ];

  sapGuiModule.runScript(job, 'T_ZOPP.exe', args, checkOutputFile.bind(null, done));
};
