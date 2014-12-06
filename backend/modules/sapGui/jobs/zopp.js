// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function runZoppJob(app, sapGuiModule, jobId, done)
{
  var args = [
    '--output-file',
    Math.floor(Date.now() / 1000) + '@T_ZOPP_1.txt'
  ];

  sapGuiModule.runScript(jobId, 'T_ZOPP.exe', args, done);
};
