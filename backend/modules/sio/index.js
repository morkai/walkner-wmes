// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var socketIo = require('socket.io');
var SocketIoMultiServer = require('./SocketIoMultiServer');
var pmx = null;

try
{
  pmx = require('pmx');
}
catch (err) {}

exports.DEFAULT_CONFIG = {
  httpServerId: 'httpServer',
  httpsServerId: 'httpsServer',
  path: '/sio'
};

exports.start = function startIoModule(app, sioModule)
{
  var httpServer = app[sioModule.config.httpServerId];
  var httpsServer = app[sioModule.config.httpsServerId];

  if (!httpServer && !httpsServer)
  {
    throw new Error("sio module requires the httpServer(s) module");
  }

  var probes = {
    currentUsersCounter: null,
    totalConnectionTime: null,
    totalConnectionCount: null
  };

  if (pmx)
  {
    var pmxProbe = pmx.probe();

    probes.currentUsersCounter = pmxProbe.counter({name: 'sio:currentUsers'});
    probes.totalConnectionTime = pmxProbe.histogram({name: 'sio:totalConnectionTime', measurement: 'sum'});
    probes.totalConnectionCount = pmxProbe.histogram({name: 'sio:totalConnectionCount', measurement: 'sum'});
  }

  var multiServer = new SocketIoMultiServer();

  if (httpServer)
  {
    multiServer.addServer(httpServer.server);
  }

  if (httpsServer)
  {
    multiServer.addServer(httpsServer.server);
  }

  var sio = socketIo(multiServer, {
    path: sioModule.config.path,
    transports: ['websocket', 'xhr-polling'],
    serveClient: true
  });

  sioModule = app[sioModule.name] = _.merge(sio, sioModule);

  sio.sockets.setMaxListeners(25);

  sioModule.on('connection', function(socket)
  {
    socket.handshake.connectedAt = Date.now();

    if (pmx)
    {
      probes.currentUsersCounter.inc();

      socket.on('disconnect', function()
      {
        probes.totalConnectionCount.update(1);
        probes.totalConnectionTime.update((Date.now() - socket.handshake.connectedAt) / 1000);
        probes.currentUsersCounter.dec();
      });
    }

    socket.on('echo', function()
    {
      socket.emit.apply(socket, ['echo'].concat(Array.prototype.slice.call(arguments)));
    });

    socket.on('time', function(reply)
    {
      if (_.isFunction(reply))
      {
        reply(Date.now(), 'Europe/Warsaw');
      }
    });

    socket.on('sio.getConnections', function(reply)
    {
      if (!_.isFunction(reply) || !socket.handshake.user || !socket.handshake.user.super)
      {
        return;
      }

      var res = {
        socketCount: 0,
        userCount: 0,
        users: {}
      };

      _.forEach(sioModule.sockets.connected, function(socket)
      {
        ++res.socketCount;

        var user = socket.handshake.user || {};

        if (res.users[user._id] === undefined)
        {
          res.users[user._id] = {
            _id: user._id,
            login: user.login,
            name: ((user.lastName || '') + ' ' + (user.firstName || '')).trim(),
            sockets: []
          };

          ++res.userCount;
        }

        res.users[user._id].sockets.push({
          _id: socket.id,
          ipAddress: user.ipAddress
        });
      });

      reply(res);
    });
  });
};
