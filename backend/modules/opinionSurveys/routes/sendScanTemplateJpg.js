// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');

module.exports = function sendScanTemplateJpgRoute(app, module, req, res, next)
{
  const express = app[module.config.expressId];

  if (!/^[a-z0-9]+$/.test(req.params.id))
  {
    return next(express.createHttpError('INVALID_ID'), 400);
  }

  res.sendFile(path.join(module.config.templatesPath, req.params.id + '.jpg'));
};
