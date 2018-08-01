// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const passport = require('passport');
const login = require('./login');
const setUpRoutes = require('./routes');
const setUpCommands = require('./commands');
const syncUsers = require('./syncUsers');
const setUpPresenceChecker = require('./presenceChecker');
const setUpOffice365 = require('./office365');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  companiesId: 'companies',
  settingsId: 'settings',
  mailSenderId: 'mail/sender',
  tediousConnection: null,
  emailGenerator: null,
  browsePrivileges: ['USERS:VIEW'],
  office365: null
};

exports.setUp = function setUpUsersModule(app, {config})
{
  if (config.office365)
  {
    app.broker.subscribe('express.beforeMiddleware', ({module}) =>
    {
      module.app.use(passport.initialize());
    });
  }
};

exports.start = function startUsersModule(app, module)
{
  module.syncing = false;

  module.login = login.bind(null, app, module);

  module.syncUsers = trySyncUsers;

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.sioId,
      module.config.companiesId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.settingsId
    ],
    setUpPresenceChecker.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpOffice365.bind(null, app, module)
  );

  app.broker.subscribe('app.started', scheduleNextUserSync).setLimit(1);

  function scheduleNextUserSync()
  {
    const m = moment().add(30, 'seconds');
    const h = m.hours();
    const s = moment().startOf('day');

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

    module.info(`Next sync at ${app.formatDateTime(s.toDate())}.`);

    setTimeout(module.syncUsers, s.diff());
  }

  function trySyncUsers(user)
  {
    if (module.syncing)
    {
      return;
    }

    module.info('Syncing...');

    module.syncing = true;

    syncUsers(app, module, function(err, stats)
    {
      module.syncing = false;

      if (err)
      {
        if (err.message === 'MODULE')
        {
          return;
        }

        module.error('Failed to sync: %s', err.message);

        app.broker.publish('users.syncFailed', {user: user, error: err.message});
      }
      else
      {
        module.info('Synced: %s', JSON.stringify(stats));

        app.broker.publish('users.synced', stats);
      }

      if (!user)
      {
        scheduleNextUserSync();
      }
    });
  }
};
