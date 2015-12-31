// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function runDocsJob(app, sapGuiModule, job, done)
{
  sapGuiModule.runScript(job, 'T_ZLF1.exe', [], done);
};
