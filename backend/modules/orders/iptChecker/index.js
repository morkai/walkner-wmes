// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpChecker = require('./checker');
const setUpNotifier = require('./notifier');
const setUpMessengerServer = require('./messengerServer');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  mysqlId: 'mysql',
  settingsId: 'settings',
  mailSenderId: 'mail/sender',
  messengerServerId: 'messenger/server',
  emailUrlPrefix: 'http://localhost/',
  morUrl: 'http://localhost/mor/iptCheck',
  iptUrl: 'http://ipt-order-check/order/check/${order}'
};

exports.start = function startOrdersIptCheckerModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.mysqlId,
      module.config.settingsId
    ],
    setUpChecker.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.mailSenderId
    ],
    setUpNotifier.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.messengerServerId
    ],
    setUpMessengerServer.bind(null, app, module)
  );
};
