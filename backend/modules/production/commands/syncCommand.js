// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
