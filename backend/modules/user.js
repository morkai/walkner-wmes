'use strict';

var os = require('os');
var connect = require('connect');
var cookie = require('cookie');
var lodash = require('lodash');

exports.DEFAULT_CONFIG = {
  sioId: 'sio',
  expressId: 'express',
  privileges: [],
  root: {
    password: '$2a$10$qSJWcm1LtN0OzlSHkSRl..ZezbqHAjW2ZuHzBd.F0CTQoWBvf0uQi'
  },
  guest: {}
};

exports.start = function startUserModule(app, module)
{
  var localAddresses = getLocalAddresses();

  module.root = lodash.merge(module.config.root, {
    loggedIn: true,
    super: true,
    _id: 'admin1234567890123456789',
    login: 'root',
    privileges: []
  });

  module.guest = lodash.merge({privileges: []}, module.config.guest, {
    loggedIn: false,
    super: false,
    _id: 'guest1234567890123456789',
    login: 'guest',
    password: undefined
  });

  module.auth = createAuthMiddleware;
  module.isLocalIpAddress = isLocalIpAddress;

  app.onModuleReady([module.config.expressId, module.config.sioId], setUpSio);

  /**
   * @private
   * @returns {Array.<string>}
   */
  function getLocalAddresses()
  {
    var localAddresses = [];

    lodash.each(os.networkInterfaces(), function(addresses)
    {
      addresses.forEach(function(address)
      {
        if (address.family === 'IPv4')
        {
          localAddresses.push(address.address.replace(/\.[0-9]+$/, ''));
        }
      });
    });

    return localAddresses;
  }

  /**
   * @param {string} ipAddress
   * @returns {boolean}
   */
  function isLocalIpAddress(ipAddress)
  {
    return localAddresses.indexOf(ipAddress.replace(/\.[0-9]+$/, '')) !== -1;
  }

  /**
   * @param {string|Array.<string>} requiredPrivileges
   * @returns {function(object, object, function)}
   */
  function createAuthMiddleware(requiredPrivileges)
  {
    if (!Array.isArray(requiredPrivileges))
    {
      requiredPrivileges = requiredPrivileges ? [requiredPrivileges] : [];
    }

    var l = requiredPrivileges.length;

    return function(req, res, next)
    {
      if (!req.session.user)
      {
        req.session.user = module.config.guest;
      }

      var user = req.session.user;

      if (!user || !user.privileges)
      {
        return res.send(401);
      }

      if (user.super)
      {
        return next();
      }

      for (var i = 0; i < l; ++i)
      {
        if (user.privileges.indexOf(requiredPrivileges[i]) === -1)
        {
          return res.send(401);
        }
      }

      return next();
    };
  }

  /**
   * @private
   */
  function setUpSio()
  {
    var sio = app[module.config.sioId];
    var sosMap = {};

    sio.set('authorization', function(handshakeData, done)
    {
      var express = app[module.config.expressId];
      var cookies = cookie.parse(String(handshakeData.headers.cookie));
      var sessionCookie = cookies[express.config.sessionCookieKey];
      var sessionId = connect.utils.parseSignedCookie(
        sessionCookie, express.config.cookieSecret
      );

      express.sessionStore.get(sessionId, function(err, session)
      {
        if (err)
        {
          return done(err);
        }

        handshakeData.sessionId = sessionId;
        handshakeData.user = session.user || module.guest;

        done(null, true);
      });
    });

    sio.sockets.on('connection', function(socket)
    {
      if (socket.handshake.sessionId)
      {
        socket.sessionId = socket.handshake.sessionId;

        if (typeof sosMap[socket.sessionId] === 'undefined')
        {
          sosMap[socket.sessionId] = {};
        }

        sosMap[socket.sessionId][socket.id] = true;
      }

      if (socket.handshake.user)
      {
        socket.emit('user.reload', socket.handshake.user);
      }

      socket.on('disconnect', function()
      {
        var sessionSockets = sosMap[socket.sessionId];

        if (typeof sessionSockets === 'undefined')
        {
          return;
        }

        delete sessionSockets[socket.id];

        if (Object.keys(sessionSockets).length === 0)
        {
          delete sessionSockets[socket.sessionId];
        }
      });
    });

    app.broker.subscribe('users.login', function(message)
    {
      var sockets = moveSos(message.oldSessionId, message.newSessionId);

      sockets.forEach(function(socket)
      {
        socket.handshake.sessionId = message.newSessionId;
        socket.handshake.user = message.user;

        if (socket.id !== message.socketId)
        {
          socket.emit('user.reload', message.user);
        }
      });
    });

    app.broker.subscribe('users.logout', function(message)
    {
      var sockets = moveSos(message.oldSessionId, message.newSessionId);

      sockets.forEach(function(socket)
      {
        socket.handshake.sessionId = message.newSessionId;
        socket.handshake.user = module.guest;

        if (socket.id !== message.socketId)
        {
          socket.emit('user.reload', module.guest);
        }
      });
    });

    function moveSos(oldSessionId, newSessionId)
    {
      var sockets = [];

      if (typeof sosMap[oldSessionId] !== 'object')
      {
        return sockets;
      }

      Object.keys(sosMap[oldSessionId]).forEach(function(socketId)
      {
        var socket = sio.sockets.sockets[socketId];

        if (typeof socket === 'undefined')
        {
          delete sosMap[oldSessionId][socketId];
        }
        else
        {
          socket.sessionId = newSessionId;

          sockets.push(socket);
        }
      });

      if (newSessionId !== oldSessionId)
      {
        sosMap[newSessionId] = sosMap[oldSessionId];

        delete sosMap[oldSessionId];
      }

      return sockets;
    }
  }
};
