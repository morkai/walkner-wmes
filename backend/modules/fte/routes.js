'use strict';

var crud = require('../express/crud');

module.exports = function setUpFteRoutes(app, fteModule)
{
  var express = app[fteModule.config.expressId];
  var auth = app[fteModule.config.userId].auth;
  var mongoose = app[fteModule.config.mongooseId];
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var canViewLeader = auth('FTE:LEADER:VIEW');
  var canManageLeader = auth('FTE:LEADER:MANAGE');

  express.get('/fte/leader', canViewLeader, crud.browseRoute.bind(null, app, FteLeaderEntry));

  express.get('/fte/leader/current', canManageLeader, getCurrentFteLeaderEntryRoute);

  express.get('/fte/leader/:id', canViewLeader, crud.readRoute.bind(null, app, FteLeaderEntry));

  function getCurrentFteLeaderEntryRoute(req, res, next)
  {
    var currentUser = req.session.user;

    if (!currentUser.aor)
    {
      res.statusCode = 400;

      return next(new Error('NO_AOR'));
    }

    var currentShiftId = getCurrentShiftId(currentUser.aor);

    FteLeaderEntry.findOne(currentShiftId, function(err, fteLeaderEntry)
    {
      if (err)
      {
        return next(err);
      }

      if (fteLeaderEntry !== null)
      {
        return res.send(fteLeaderEntry.toJSON());
      }

      FteLeaderEntry.createForShift(currentShiftId, function(err, fteLeaderEntry)
      {
        if (err)
        {
          return next(err);
        }

        res.send(fteLeaderEntry);

        app.broker.publish('fte.leader.created', {
          user: currentUser,
          model: {
            _id: fteLeaderEntry.get('_id'),
            aor: currentShiftId.aor,
            date: currentShiftId.date,
            shift: currentShiftId.shift
          }
        });
      });
    });
  }

  function getCurrentShiftId(aor)
  {
    var currentShift = fteModule.getCurrentShift();

    return {
      aor: aor,
      date: currentShift.date,
      shift: currentShift.shift
    };
  }
};
