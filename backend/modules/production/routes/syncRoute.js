// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function syncRoute(app, productionModule, req, res)
{
  var creator = app[productionModule.config.userId].createUserInfo(req.session.user, req);

  productionModule.syncLogEntryStream(creator, req.body, function(err, lockLogEntry)
  {
    if (lockLogEntry)
    {
      res.json({
        lock: {
          secretKey: lockLogEntry.secretKey,
          prodLine: lockLogEntry.prodLine
        }
      });
    }
    else
    {
      res.json({});
    }
  });
};
