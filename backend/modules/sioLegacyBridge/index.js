// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var patchNewSocket = require('./patchNewSocket');

exports.DEFAULT_CONFIG = {
  httpServerId: 'httpServer',
  newClientPackage: 'socket.io-client',
  oldServerPackage: 'socket.io@0.9',
  newSioServerUrl: 'http://127.0.0.1/',
  newSioClientOptions: {},
  oldSioServerOptions: {}
};

exports.start = function startSioLegacyBridgeModule(app, module)
{
  var httpServer = app[module.config.httpServerId];

  if (!httpServer)
  {
    throw new Error("The `httpServer` module is required!");
  }

  var newSocketIoClient = require(module.config.newClientPackage);
  var oldSocketIoServer = require(module.config.oldServerPackage);

  var DEFAULT_SERVER_OPTIONS = {
    log: false,
    resource: '/socket.io',
    'destroy upgrade': false
  };
  var DEFAULT_CLIENT_OPTIONS = {
    path: '/sio',
    transports: ['websocket'],
    autoConnect: true,
    timeout: 5000,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: true
  };

  var serverOptions = _.assign(DEFAULT_SERVER_OPTIONS, module.config.oldSioServerOptions);
  var oldServer = oldSocketIoServer.listen(httpServer.server, serverOptions);

  oldServer.sockets.on('connection', onConnection);

  function onConnection(oldSocket)
  {
    var newSocket = createNewClient(oldSocket);

    oldSocket.$emit = function(eventName)
    {
      if (eventName === 'newListener' || eventName === 'removeListener')
      {
        return;
      }

      if (eventName === 'disconnect')
      {
        newSocket.removeAllListeners();
        newSocket.close();
        newSocket = null;

        return;
      }

      return newSocket.emit.apply(newSocket, arguments);
    };
  }

  function createNewClient(oldSocket)
  {
    var clientOptions = _.assign({}, DEFAULT_CLIENT_OPTIONS, module.config.newSioClientOptions);
    var newSocket = newSocketIoClient.connect(module.config.newSioServerUrl, clientOptions);

    patchNewSocket(newSocket, function(args)
    {
      oldSocket.emit.apply(oldSocket, args);
    });

    return newSocket;
  }
};
