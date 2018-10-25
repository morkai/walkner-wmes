// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setUpProdDowntimesCommands(app, prodDowntimesModule)
{
  const sio = app[prodDowntimesModule.config.sioId];
  const userModule = app[prodDowntimesModule.config.userId];
  const productionModule = app[prodDowntimesModule.config.productionId];
  const ProdLogEntry = app[prodDowntimesModule.config.mongooseId].model('ProdLogEntry');

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

    const user = socket.handshake.user;

    if (!user.loggedIn)
    {
      return reply(new Error('AUTH'));
    }

    data = _.pick(data, ['_id', 'status', 'decisionComment', 'reason', 'aor']);

    if (!_.isString(data._id) || _.isEmpty(data._id)
      || (data.status !== undefined && !_.includes(['undecided', 'rejected', 'confirmed'], data.status))
      || (data.reason !== undefined && (!_.isString(data.reason) || _.isEmpty(data.reason)))
      || (data.aor !== undefined && (!_.isString(data.aor) || !/^[0-9a-f]{24}$/.test(data.aor))))
    {
      return reply(new Error('INPUT'));
    }

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

        const corroborator = userModule.createUserInfo(user, socket);

        if (_.isObject(data.corroborator) && _.isString(data.corroborator.cname))
        {
          corroborator.cname = data.corroborator.cname;
        }

        data.corroborator = corroborator;
        data.corroboratedAt = new Date();

        let createdAt = data.corroboratedAt;

        if (createdAt < prodDowntime.startedAt)
        {
          createdAt = new Date(prodDowntime.startedAt.getTime() + 1);
        }

        const prodLogEntry = new ProdLogEntry({
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
      function updateProdDowntimeStep(err, prodLogEntry)
      {
        if (err)
        {
          prodDowntimesModule.error(
            'Failed to create a ProdLogEntry during corroboration of the [%s] ProdDowntime: %s',
            this.prodDowntime._id,
            err.stack
          );
        }

        const prodDowntime = this.prodDowntime;
        const changeData = {};

        _.forEach(['status', 'reason', 'aor'], function(property)
        {
          if (data[property] && String(data[property]) !== String(prodDowntime[property]))
          {
            changeData[property] = [prodDowntime[property], data[property]];
          }
        });

        this.prodLogEntryId = prodLogEntry._id;
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
        const changes = this.changes;
        const prodDowntime = this.prodDowntime;

        this.changes = null;
        this.prodDowntime = null;

        if (err)
        {
          if (this.prodLogEntryId)
          {
            ProdLogEntry.collection.deleteOne({_id: this.prodLogEntryId}, () => {});
          }

          prodDowntimesModule.error('Failed to corroborate downtime [%s]: %s', prodDowntime._id, err.message);

          return reply(err);
        }

        reply();

        data.changes = changes;

        app.broker.publish('prodDowntimes.corroborated.' + prodDowntime.prodLine + '.' + prodDowntime._id, data);
      }
    );
  }
};
