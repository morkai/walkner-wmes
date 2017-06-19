// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');

module.exports = function downloadRoute(file, app, xiconfModule, XiconfResult, req, res, next)
{
  XiconfResult.findById(req.params.id).lean().exec(function(err, xiconfResult)
  {
    if (err)
    {
      return next(err);
    }

    if (!xiconfResult)
    {
      return res.sendStatus(404);
    }

    let suffix = '_' + app.formatDate(xiconfResult.startedAt);
    const startedAtHour = xiconfResult.startedAt.getHours();

    if (startedAtHour >= 6 && startedAtHour < 14)
    {
      suffix += '_I';
    }
    else if (startedAtHour >= 14 && startedAtHour < 22)
    {
      suffix += '_II';
    }
    else
    {
      suffix += '_III';
    }

    let type;
    let filename;
    let fileHash;

    if (file === 'feature')
    {
      type = 'xml';
      suffix += '.xml';

      if (typeof xiconfResult.featureName === 'string')
      {
        filename = 'FEATURE_' + xiconfResult.featureName
          .replace(/ /g, '_')
          .replace(/\.xml$/i, suffix);
      }
      else
      {
        filename = 'FEATURE' + suffix;
      }

      fileHash = xiconfResult.featureHash;
    }
    else if (file === 'gprsOrder')
    {
      type = 'txt';
      suffix += '.dat';
      filename = xiconfResult.orderNo + suffix;
      fileHash = xiconfResult.gprsOrderFileHash;
    }
    else if (file === 'gprsInput')
    {
      type = 'json';
      suffix += '.json';
      filename = (xiconfResult.serviceTag || '').replace(/^P0+/, '') + suffix;
      fileHash = xiconfResult.gprsInputFileHash;
    }
    else if (file === 'gprsOutput')
    {
      type = 'xml';
      suffix += '.xml';
      filename = (xiconfResult.serviceTag || '').replace(/^P0+/, '') + suffix;
      fileHash = xiconfResult.gprsOutputFileHash;
    }
    else
    {
      type = 'txt';
      suffix += 'txt';
      filename = 'WORKFLOW_' + suffix;
    }

    res.type(type);
    res.attachment(filename);

    if (file === 'workflow')
    {
      return res.send(xiconfResult.workflow);
    }

    if (fileHash)
    {
      return res.sendFile(path.join(xiconfModule.config.featureDbPath, fileHash + '.xml'));
    }

    res.send('?');
  });
};
