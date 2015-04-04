// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');

module.exports = function downloadRoute(file, icpoModule, IcpoResult, req, res, next)
{
  var fields = {
    serviceTag: 1
  };

  fields[file + 'FileHash'] = 1;
  fields[file + 'FilePath'] = 1;

  IcpoResult.findById(req.params.id, fields).lean().exec(function(err, icpoResult)
  {
    if (err)
    {
      return next(err);
    }

    if (!icpoResult)
    {
      return res.sendStatus(404);
    }

    var mimeType;
    var fileName;

    switch (file)
    {
      case 'order':
        mimeType = 'text/plain';
        fileName = path.basename(icpoResult[file + 'FilePath']);
        break;

      case 'driver':
      case 'gprs':
        mimeType = 'xml';
        fileName = path.basename(icpoResult[file + 'FilePath']);
        break;

      case 'input':
        mimeType = 'json';
        fileName = icpoResult.serviceTag.substr(4) + '.json';
        break;

      case 'output':
        mimeType = 'xml';
        fileName = icpoResult.serviceTag.substr(4) + '.xml';
        break;
    }

    res.type(mimeType);
    res.attachment(fileName);
    res.sendFile(path.join(icpoModule.config.fileStoragePath, icpoResult[file + 'FileHash'] || ''));
  });
};
