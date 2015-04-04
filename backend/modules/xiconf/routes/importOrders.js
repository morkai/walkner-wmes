// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function importOrdersRoute(app, xiconfModule, req, res, next)
{
  res.type('text/plain');

  if (!req.is('text/plain'))
  {
    return res.status(400).send('INVALID_CONTENT_TYPE');
  }

  var timestamp = parseInt(req.query.timestamp, 10);
  var step = parseInt(req.query.step, 10);

  if (isNaN(timestamp) || isNaN(step) || req.body.length < 256)
  {
    return res.status(400).send('INPUT');
  }

  var importFile = xiconfModule.config.ordersImportFile
    .replace('{timestamp}', timestamp)
    .replace('{step}', step);

  fs.writeFile(path.join(xiconfModule.config.ordersImportPath, importFile), req.body, function(err)
  {
    if (err)
    {
      return next(err);
    }

    return res.sendStatus(204);
  });
};
