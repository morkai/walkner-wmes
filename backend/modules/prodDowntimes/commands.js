'use strict';

var lodash = require('lodash');
var userInfo = require('../../models/userInfo');

module.exports = function setUpProdDowntimesCommands(app, prodDowntimesModule)
{
  var sio = app[prodDowntimesModule.config.sioId];
  var productionModule = app[prodDowntimesModule.config.productionId];
  var ProdLogEntry = app[prodDowntimesModule.config.mongooseId].model('ProdLogEntry');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('prodDowntimes.corroborate', function(data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      var user = socket.handshake.user;

      if (!user.super && user.privileges.indexOf('PROD_DOWNTIMES:MANAGE') === -1)
      {
        return reply(new Error('NO_AUTH'));
      }

      if (!lodash.isObject(data)
        || !lodash.isString(data._id)
        || (data.status !== 'confirmed' && data.status !== 'rejected')
        || !lodash.isString(data.decisionComment))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      productionModule.getProdData('downtime', data._id, function(err, prodDowntime)
      {
        if (err)
        {
          return reply(err);
        }

        if (!prodDowntime)
        {
          return reply(new Error('UNKNOWN_PROD_DOWNTIME'));
        }

        if (!canCorroborate(user, prodDowntime))
        {
          return reply(new Error('NO_AUTH'));
        }

        var corroborator = userInfo.createObject(user, socket);

        if (lodash.isObject(data.corroborator) && lodash.isString(data.corroborator.cname))
        {
          corroborator.cname = data.corroborator.cname;
        }

        data.corroborator = corroborator;
        data.corroboratedAt = new Date();

        var prodLogEntry = new ProdLogEntry({
          _id: ProdLogEntry.generateId(data.corroboratedAt, prodDowntime.prodShift),
          type: 'corroborateDowntime',
          data: data,
          division: prodDowntime.division,
          subdivision: prodDowntime.subdivision,
          mrpControllers: prodDowntime.mrpControllers,
          prodFlow: prodDowntime.prodFlow,
          workCenter: prodDowntime.workCenter,
          prodLine: prodDowntime.prodLine,
          prodShift: prodDowntime.prodShift,
          prodShiftOrder: prodDowntime.prodShiftOrder,
          creator: data.corroborator,
          createdAt: data.corroboratedAt,
          savedAt: new Date(),
          todo: false
        });
        prodLogEntry.save(function(err)
        {
          if (err)
          {
            prodDowntimesModule.error(
              "Failed to create a ProdLogEntry during corroboration of the [%s] ProdDowntime: %s",
              prodDowntime._id,
              err.stack
            );
          }
        });

        prodDowntime.set(data);
        prodDowntime.save(function(err)
        {
          if (err)
          {
            return reply(err);
          }

          reply();

          app.broker.publish('prodDowntimes.corroborated.' + prodDowntime.get('prodLine'), data);
        });
      });
    });
  });

  function canCorroborate(user, prodDowntime)
  {
    return !prodDowntime.aor
      || !user.aors
      || !user.aors.length
      || user.aors.map(String).indexOf(String(prodDowntime.aor)) !== -1;
  }
};
