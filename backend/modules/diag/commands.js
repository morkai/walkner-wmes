// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var userInfo = require('../../models/userInfo');

module.exports = function setUpDiagCommands(app, diagModule)
{
  var sio = app[diagModule.config.sioId];
  var mongoose = app[diagModule.config.mongooseId];
  var DiagLogEntry = mongoose.model('DiagLogEntry');

  function saveDiagLogEntry(socket, diagLogEntry)
  {
    diagLogEntry.savedAt = new Date();

    var creator = userInfo.createObject(socket.handshake.user, socket);

    if (!diagLogEntry.creator)
    {
      diagLogEntry.creator = creator;
    }
    else
    {
      diagLogEntry.creator.ip = creator.ip;
    }

    if (typeof diagLogEntry.data !== 'object')
    {
      diagLogEntry.data = null;
    }

    DiagLogEntry.create(diagLogEntry, function(err)
    {
      if (err)
      {
        diagModule.error("Failed to save diag log entry: %s", err.stack);
      }
    });
  }

  function saveDisconnectedLogEntry(socket, creator, prodLine)
  {
    saveDiagLogEntry(socket, {
      type: 'disconnected',
      data: null,
      prodLine: prodLine,
      createdAt: new Date(),
      creator: creator
    });
  }

  sio.sockets.on('connection', function(socket)
  {
    socket.on('diag.log', function(diagLogEntry)
    {
      saveDiagLogEntry(socket, diagLogEntry);

      if (diagLogEntry.type === 'connected')
      {
        socket.on(
          'disconnect',
          saveDisconnectedLogEntry.bind(null, socket, diagLogEntry.creator, diagLogEntry.prodLine)
        );
      }
    });
  });
};
