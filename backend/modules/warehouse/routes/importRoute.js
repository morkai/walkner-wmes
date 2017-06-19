// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function importRoute(app, whModule, req, res, next)
{
  res.type('text/plain');

  if (!req.is('text/plain'))
  {
    return res.status(400).send('INVALID_CONTENT_TYPE');
  }

  var type = req.query.type;
  var timestamp = parseInt(req.query.timestamp, 10);
  var step = parseInt(req.query.step, 10);

  if (isNaN(timestamp) || isNaN(step) || req.body.length < 512 || (type !== 'cc' && type !== 'to'))
  {
    return res.status(400).send('INPUT');
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

    return res.sendStatus(204);
  });
};
