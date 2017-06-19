// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const patchNewSocket = require('./patchNewSocket');

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
  const httpServer = app[module.config.httpServerId];

  if (!httpServer)
  {
    throw new Error('The `httpServer` module is required!');
  }

  const newSocketIoClient = require(module.config.newClientPackage);
  const oldSocketIoServer = require(module.config.oldServerPackage);

  const DEFAULT_SERVER_OPTIONS = {
    log: false,
    resource: '/socket.io',
    'destroy upgrade': false
  };
  const DEFAULT_CLIENT_OPTIONS = {
    path: '/sio',
    transports: ['websocket'],
    autoConnect: true,
    timeout: 5000,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: true
  };

  const serverOptions = _.assign(DEFAULT_SERVER_OPTIONS, module.config.oldSioServerOptions);
  const oldServer = oldSocketIoServer.listen(httpServer.server, serverOptions);

  oldServer.sockets.on('connection', onConnection);

  function onConnection(oldSocket)
  {
    let newSocket = createNewClient(oldSocket);

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
    const clientOptions = _.assign({}, DEFAULT_CLIENT_OPTIONS, module.config.newSioClientOptions);
    const newSocket = newSocketIoClient.connect(module.config.newSioServerUrl, clientOptions);

    patchNewSocket(newSocket, function(args)
    {
      oldSocket.emit.apply(oldSocket, args);
    });

    return newSocket;
  }
};
