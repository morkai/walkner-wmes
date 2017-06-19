// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function runKeepAliveJob(app, sapGuiModule, job, done)
{
  sapGuiModule.runScript(job, 'KeepAlive.exe', [], done);
};
