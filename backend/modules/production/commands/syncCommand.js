// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function syncCommand(app, productionModule, socket, logEntryStream, reply)
{
  var creator = app[productionModule.config.userId].createUserInfo(socket.handshake.user, socket);

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
