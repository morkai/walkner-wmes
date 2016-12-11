// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const setUpRoutes = require('./routes');
const setUpCommands = require('./commands');
const syncUsers = require('./syncUsers');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  companiesId: 'companies',
  mailSenderId: 'mail/sender',
  tediousConnection: null,
  emailGenerator: null,
  browsePrivileges: ['USERS:VIEW']
};

exports.start = function startUsersModule(app, usersModule)
{
  usersModule.syncing = false;

  usersModule.syncUsers = function(user)
  {
    if (usersModule.syncing)
    {
      return;
    }

    usersModule.info("Syncing...");

    usersModule.syncing = true;

    syncUsers(app, usersModule, function(err, stats)
    {
      usersModule.syncing = false;

      if (err)
      {
        usersModule.error("Failed to sync: %s", err.message);

        app.broker.publish('users.syncFailed', {user: user, error: err.message});
      }
      else
      {
        usersModule.info("Synced: %s", JSON.stringify(stats));

        app.broker.publish('users.synced', stats);
      }

      if (!user)
      {
        scheduleNextUserSync();
      }
    });
  };

  app.onModuleReady(
    [
      usersModule.config.mongooseId,
      usersModule.config.userId,
      usersModule.config.expressId
    ],
    setUpRoutes.bind(null, app, usersModule)
  );

  app.onModuleReady(
    [
      usersModule.config.mongooseId,
      usersModule.config.userId,
      usersModule.config.sioId,
      usersModule.config.companiesId
    ],
    setUpCommands.bind(null, app, usersModule)
  );

  app.broker.subscribe('app.started', scheduleNextUserSync).setLimit(1);

  function scheduleNextUserSync()
  {
    const m = moment().add(30, 'seconds');
    const h = m.hours();
    let s = moment().startOf('day');

    if (h < 5)
    {
      s.hours(5).minutes(30);
    }
    else if (h >= 18)
    {
      s.add(1, 'days').hours(5).minutes(30);
    }
    else
    {
      s.hours(18);
    }

    usersModule.info(`Next sync at ${app.formatDateTime(s.toDate())}.`);

    setTimeout(usersModule.syncUsers, s.diff());
  }
};
