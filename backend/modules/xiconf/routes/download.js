// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var moment = require('moment');

module.exports = function downloadRoute(file, xiconfModule, XiconfResult, req, res, next)
{
  var fields = {
    startedAt: 1
  };

  if (file === 'feature')
  {
    fields.featureName = 1;
    fields.featureHash = 1;
  }
  else
  {
    fields.workflow = 1;
  }

  XiconfResult.findById(req.params.id, function(err, xiconfResult)
  {
    if (err)
    {
      return next(err);
    }

    if (!xiconfResult)
    {
      return res.send(404);
    }

    var startedAtMoment = moment(xiconfResult.startedAt);
    var suffix = '_' + startedAtMoment.format('YYYY-MM-DD');
    var startedAtHour = startedAtMoment.hour();

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

    suffix += '.xml';

    var filename;

    if (file === 'feature')
    {
      if (typeof xiconfResult.featureName === 'string')
      {
        filename = 'FEATURE_' + xiconfResult.featureName
          .replace(/ /g, '_')
          .replace(/\.xml$/i, suffix);
      }
      else
      {
        filename = 'FEATURE_' + suffix;
      }
    }
    else
    {
      filename = 'WORKFLOW_' + suffix;
    }

    res.type('xml');
    res.attachment(filename);

    if (file === 'workflow')
    {
      return res.send(xiconfResult.workflow);
    }

    if (xiconfResult.featureHash)
    {
      return res.sendfile(
        path.join(xiconfModule.config.featureDbPath, xiconfResult.featureHash + '.xml')
      );
    }

    res.send('?');
  });
};
