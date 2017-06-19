// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function syncCommand(app, productionModule, socket, logEntryStream, reply)
{
  const creator = app[productionModule.config.userId].createUserInfo(socket.handshake.user, socket);

  productionModule.syncLogEntryStream(creator, logEntryStream, function(err, lockLogEntry)
  {
    if (lockLogEntry)
    {
      socket.emit('production.locked', {
        secretKey: lockLogEntry.secretKey,
        prodLine: lockLogEntry.prodLine
      });
    }

    if (_.isFunction(reply))
    {
      reply();
    }
  });
};
