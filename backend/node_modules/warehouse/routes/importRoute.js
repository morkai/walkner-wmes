// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function importRoute(app, whModule, req, res, next)
{
  res.type('text/plain');

  if (!req.is('text/plain'))
  {
    return res.status(400).send('INVALID_CONTENT_TYPE');
  }

  const type = req.query.type;
  const timestamp = parseInt(req.query.timestamp, 10);
  const step = parseInt(req.query.step, 10);

  if (isNaN(timestamp) || isNaN(step) || req.body.length < 512 || (type !== 'cc' && type !== 'to'))
  {
    return res.status(400).send('INPUT');
  }

  const importFile = whModule.config[type === 'cc' ? 'ccImportFile' : 'toImportFile']
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
