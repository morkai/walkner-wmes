// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var authenticate = require('./authenticate');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  companiesId: 'companies',
  sqlConnStr: null,
  loginFailureDelay: 1000
};

exports.start = function startUsersModule(app, module)
{
  module.authenticate = authenticate.bind(null, app, module);

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
};
