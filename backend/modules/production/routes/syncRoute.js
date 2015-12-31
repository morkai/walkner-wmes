// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
