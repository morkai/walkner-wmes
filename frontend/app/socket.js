define([
  'underscore',
  'socket.io',
  'app/broker',
  'app/core/Socket'
],
function(
  _,
  sio,
  broker,
  Socket
) {
  'use strict';

  var socket = new Socket(sio.connect('', {
    'resource': 'socket.io',
    'transports': ['websocket'],
    'auto connect': false,
    'connect timeout': 5000,
    'reconnect': true,
    'reconnection delay': _.random(100, 500),
    'reconnection limit': _.random(4000, 8000),
    'max reconnection attempts': Infinity
  }));

  var wasConnected = false;
  var wasReconnecting = false;

  socket.on('connecting', function()
  {
    broker.publish('socket.connecting', false);
  });

  socket.on('connect', function()
  {
    if (!wasConnected)
    {
      wasConnected = true;

      broker.publish('socket.connected');
    }
  });

  socket.on('connect_failed', function()
  {
    broker.publish('socket.connectFailed', false);
  });

  socket.on('message', function(message)
  {
    broker.publish('socket.message', message);
  });

  socket.on('disconnect', function()
  {
    broker.publish('socket.disconnected');
  });

  socket.on('reconnecting', function()
  {
    wasReconnecting = true;

    broker.publish('socket.connecting', true);
  });

  socket.on('reconnect', function()
  {
    wasReconnecting = false;

    broker.publish('socket.connected', true);
  });

  socket.on('reconnect_failed', function()
  {
    wasReconnecting = false;

    broker.publish('socket.connectFailed', true);
  });

  socket.on('error', forceReconnectOnFirstConnectFailure);

  socket.on('error', function()
  {
    if (wasReconnecting)
    {
      broker.publish('socket.connectFailed', true);
    }
  });

  /**
   * @private
   * @param {*} err
   */
  function forceReconnectOnFirstConnectFailure(err)
  {
    if (err === '' && !wasConnected)
    {
      socket.off('error', forceReconnectOnFirstConnectFailure);
      socket.reconnect();
    }
  }

  window.socket = socket;

  return socket;
});
