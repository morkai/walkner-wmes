'use strict';

var lodash = require('lodash');

module.exports = function setUpWorkCentersRoutes(app, fteModule)
{
  var sio = app[fteModule.config.sioId];
  var auth = app[fteModule.config.userId].auth;
  var mongoose = app[fteModule.config.mongooseId];
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('fte.leader.updateCount', function(data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isNumber(data.taskIndex)
        || !lodash.isNumber(data.companyIndex)
        || !lodash.isNumber(data.newCount))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      var aor;
      var user = socket.handshake.user;

      if (user && user.aor)
      {
        aor = user.aor.toString();
      }
      else
      {
        return reply(new Error('NO_AOR'));
      }

      var condition = {_id: data._id, aor: aor};

      FteLeaderEntry.findOne(condition, {date: 1, shift: 1}).exec(function(err, fteLeaderEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteLeaderEntry === null)
        {
          return reply(new Error('UNKNOWN_ENTRY'));
        }

        if (fteLeaderEntry.isLocked())
        {
          return reply(new Error('ENTRY_LOCKED'));
        }

        var update = {$set: {}};
        var field = 'tasks.' + data.taskIndex + '.companies.' + data.companyIndex + '.count';

        update.$set[field] = data.newCount;

        FteLeaderEntry.update(condition, update, function(err, updatedCount)
        {
          if (err)
          {
            return reply(err);
          }

          if (updatedCount !== 1)
          {
            return reply(new Error('UNKNOWN_ENTRY'));
          }

          reply();

          app.pubsub.publish('fte.leader.' + aor, data);
        });
      });
    });
  });
};
