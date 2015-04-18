// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  companiesId: 'companies',
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
