// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var path = require('path');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  secretKey: '',
  importPath: './'
};

exports.start = function startSapGuiImporterModule(app, module)
{
  app.onModuleReady(module.config.expressId, function()
  {
    app[module.config.expressId].post('/sapGui;import', importRoute);
  });

  function importRoute(req, res, next)
  {
    res.type('text/plain');

    if (!req.is('text/plain'))
    {
      return res.status(400).send('INVALID_CONTENT_TYPE');
    }

    if (req.query.secretKey !== module.config.secretKey)
    {
      return res.status(403).send('INVALID_SECRET_KEY');
    }

    var fileName = req.query.fileName;
    var timestamp = parseInt(req.query.timestamp, 10);

    if (!/^[a-zA-Z0-9_-]+\.(txt|json|html)$/.test(fileName) || isNaN(timestamp))
    {
      return res.status(400).send('INVALID_INPUT');
    }

    var importFileName = timestamp + '@' + fileName;
    var importFilePath = path.join(module.config.importPath, importFileName);

    fs.writeFile(importFilePath, req.body, function(err)
    {
      if (err)
      {
        return next(err);
      }

      module.debug("Imported: %s", importFileName);

      return res.sendStatus(204);
    });
  }
};
