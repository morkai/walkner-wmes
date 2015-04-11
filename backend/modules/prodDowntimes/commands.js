// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpProdDowntimesCommands(app, prodDowntimesModule)
{
  var sio = app[prodDowntimesModule.config.sioId];
  var userModule = app[prodDowntimesModule.config.userId];
  var productionModule = app[prodDowntimesModule.config.productionId];
  var ProdLogEntry = app[prodDowntimesModule.config.mongooseId].model('ProdLogEntry');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('prodDowntimes.corroborate', handleCorroborate.bind(null, socket));
  });

  function handleCorroborate(socket, data, reply)
  {
    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    var user = socket.handshake.user;

    if (!user.loggedIn)
    {
      return reply(new Error('AUTH'));
    }

    if (!_.isObject(data)
      || !_.isString(data._id)
      || !_.isString(data.decisionComment))
    {
      return reply(new Error('INPUT'));
    }

    data = _.pick(data, ['_id', 'status', 'decisionComment', 'reason', 'aor']);

    step(
      function getProdDowntimeStep()
      {
        productionModule.getProdData('downtime', data._id, this.next());
      },
      function createProdLogEntryStep(err, prodDowntime)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodDowntime)
        {
          return this.skip(new Error('INPUT'));
        }

        this.prodDowntime = prodDowntime;

        var corroborator = userModule.createUserInfo(user, socket);

        if (_.isObject(data.corroborator) && _.isString(data.corroborator.cname))
        {
          corroborator.cname = data.corroborator.cname;
        }

        data.corroborator = corroborator;
        data.corroboratedAt = new Date();

        var createdAt = data.corroboratedAt;

        if (createdAt < prodDowntime.startedAt)
        {
          createdAt = new Date(prodDowntime.startedAt.getTime() + 1);
        }

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
          createdAt: createdAt,
          savedAt: data.corroboratedAt,
          todo: false
        });
        prodLogEntry.save(this.next());
      },
      function updateProdDowntimeStep(err)
      {
        if (err)
        {
          prodDowntimesModule.error(
            "Failed to create a ProdLogEntry during corroboration of the [%s] ProdDowntime: %s",
            this.prodDowntime._id,
            err.stack
          );
        }

        var prodDowntime = this.prodDowntime;
        var changeData = {};

        _.forEach(['status', 'reason', 'aor'], function(property)
        {
          if (data[property] && String(data[property]) !== String(prodDowntime[property]))
          {
            changeData[property] = [prodDowntime[property], data[property]];
          }
        });

        this.changes = {
          date: data.corroboratedAt,
          user: data.corroborator,
          data: changeData,
          comment: data.decisionComment
        };

        prodDowntime.changes.push(this.changes);
        prodDowntime.set(data);
        prodDowntime.save(this.next());
      },
      function finalizeStep(err)
      {
        var changes = this.changes;
        var prodDowntime = this.prodDowntime;

        this.changes = null;
        this.prodDowntime = null;

        if (err)
        {
          return reply(err);
        }

        reply();

        data.changes = changes;

        app.broker.publish('prodDowntimes.corroborated.' + prodDowntime.prodLine + '.' + prodDowntime._id, data);
      }
    );
  }
};
