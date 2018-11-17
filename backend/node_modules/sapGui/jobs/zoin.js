// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const checkOutputFile = require('./checkOutputFile');

module.exports = function runZoinJob(app, sapGuiModule, job, done)
{
  const args = [
    '--output-file',
    Math.floor(Date.now() / 1000) + '@' + (job.outputFile || 'T_ZOIN.txt'),
    '--plant',
    job.plant,
    '--mrp',
    job.mrp
  ];

  sapGuiModule.runScript(job, 'T_ZOIN.exe', args, checkOutputFile.bind(null, done));
};
