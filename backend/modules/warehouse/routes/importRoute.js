// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function importRoute(app, whModule, req, res, next)
{
  res.type('text/plain');

  if (!req.is('text/plain'))
  {
    return res.send(400, 'INVALID_CONTENT_TYPE');
  }

  var type = req.query.type;
  var timestamp = parseInt(req.query.timestamp, 10);
  var step = parseInt(req.query.step, 10);

  if (isNaN(timestamp) || isNaN(step) || req.body.length < 512 || (type !== 'cc' && type !== 'to'))
  {
    return res.send(400, 'INPUT');
  }

  var importFile = whModule.config[type === 'cc' ? 'ccImportFile' : 'toImportFile']
    .replace('{timestamp}', timestamp)
    .replace('{step}', step);

  fs.writeFile(path.join(whModule.config.importPath, importFile), req.body, function(err)
  {
    if (err)
    {
      return next(err);
    }

    return res.send(204);
  });
};
