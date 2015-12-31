// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  companiesId: 'companies',
  mailSenderId: 'mail/sender',
  tediousConnection: null
};

exports.start = function startUsersModule(app, usersModule)
{
  usersModule.syncing = false;

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
};
