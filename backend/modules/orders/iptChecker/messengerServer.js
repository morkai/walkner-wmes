// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpMessengerServer(app, module)
{
  const messengerServer = app[module.config.messengerServerId];

  messengerServer.handle('orders/iptChecker/checkOrders', checkOrders);

  messengerServer.handle('orders/iptChecker/notifyUsers', notifyUsers);

  function checkOrders(data, done)
  {
    if (!module.checkOrders)
    {
      return done(new Error('UNAVAILABLE'));
    }

    module.checkOrders(done);
  }

  function notifyUsers(data, done)
  {
    if (!module.checkOrders)
    {
      return done(new Error('UNAVAILABLE'));
    }

    if (!data || !_.isArray(data.orders) || !data.orders.length)
    {
      return done(new Error('INPUT'));
    }

    module.notifyUsers({_id: {$in: data.orders}}, done);
  }
};
