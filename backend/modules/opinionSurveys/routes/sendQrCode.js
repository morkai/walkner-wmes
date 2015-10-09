// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var spawn = require('child_process').spawn;

module.exports = function sendQrCodeRoute(app, module, req, res, next)
{
  var express = app[module.config.expressId];

  if (!/^[A-Za-z0-9-_/]+$/.test(req.query.data))
  {
    return next(express.createHttpError('INVALID_DATA', 400));
  }

  res.type('png');

  var args = [
    '-b', 58,
    '--vers=5',
    '--scale=1.5',
    '--directpng',
    '--data=' + req.query.data
  ];

  var p = spawn(module.config.zintExe, args);

  p.on('error', next);

  p.stdout.pipe(res);
};
