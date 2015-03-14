// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var checkOutputFile = require('./checkOutputFile');

module.exports = function runXiconfJob(app, sapGuiModule, job, done)
{
  var args = [
    '--output-file',
    Math.floor(Date.now() / 1000) + '@T_COOIS_XICONF_1.txt'
  ];

  sapGuiModule.runScript(job, 'T_COOIS_XICONF.exe', args, checkOutputFile.bind(null, done));
};
