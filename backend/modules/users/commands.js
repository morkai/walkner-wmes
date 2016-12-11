// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var syncUsers = require('./syncUsers');

module.exports = function setUpUsersCommands(app, usersModule)
{
  var sio = app[usersModule.config.sioId];

  sio.sockets.on('connection', function(socket)
  {
    socket.on('users.sync', handleUsersSyncRequest.bind(null, socket));
  });

  function handleUsersSyncRequest(socket, reply)
  {
    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (usersModule.syncing)
    {
      return reply();
    }

    var user = socket.handshake.user || {privileges: []};

    if (!user.super && user.privileges.indexOf('USERS:MANAGE') === -1)
    {
      return reply(new Error('AUTH'));
    }

    reply();

    usersModule.syncUsers(user);
  }
};
