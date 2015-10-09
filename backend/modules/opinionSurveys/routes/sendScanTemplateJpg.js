// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');

module.exports = function sendScanTemplateJpgRoute(app, module, req, res, next)
{
  var express = app[module.config.expressId];

  if (!/^[a-z0-9]+$/.test(req.params.id))
  {
    return next(express.createHttpError('INVALID_ID'), 400);
  }

  res.sendFile(path.join(module.config.templatesPath, req.params.id + '.jpg'));
};
