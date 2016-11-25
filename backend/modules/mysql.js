// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const mysql = require('mysql');

exports.DEFAULT_CONFIG = {
  connection: {}
};

exports.start = function startMysqlModule(app, module)
{
  module.pool = mysql.createPool(module.config.connection);
};
