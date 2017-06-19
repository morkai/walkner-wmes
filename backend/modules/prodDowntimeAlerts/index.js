// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');
var setUpServer = require('./server');
var setUpClient = require('./client');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  fteId: 'fte',
  messengerServerId: null,
  messengerClientId: null,
  mailSenderId: 'mail/sender',
  smsSenderId: 'sms/sender',
  emailUrlPrefix: 'http://127.0.0.1/'
};

exports.start = function startProdDowntimeAlertsModule(app, module)
{
  if (module.config.emailUrlPrefix.substr(-1) !== '/')
  {
    module.config.emailUrlPrefix += '/';
  }

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
      module.config.fteId,
      module.config.messengerServerId
    ],
    setUpServer.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.fteId,
      module.config.messengerClientId
    ],
    setUpClient.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.fteId
    ],
    function()
    {
      if (!module.config.messengerServerId && !module.config.messengerClientId)
      {
        setUpServer(app, module);
        setUpClient(app, module);
      }
    }
  );
};
