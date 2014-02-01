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
  guest: {},
  localAddresses: null
};

exports.start = function startUserModule(app, module)
{
  var localAddresses = module.config.localAddresses || getLocalAddresses();

  module.root = lodash.merge(module.config.root, {
    loggedIn: true,
    super: true,
    _id: '52a33b8bfb955dac8a92261b',
    login: 'root',
    privileges: []
  });

  module.guest = lodash.merge({privileges: []}, module.config.guest, {
    loggedIn: false,
    super: false,
    _id: '52a33b9cfb955dac8a92261c',
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
   * @private
   * @param {string} ipAddress
   * @returns {object}
   */
  function createGuestData(ipAddress)
  {
    var user = lodash.cloneDeep(module.guest);

    user.ipAddress = ipAddress;
    user.local = isLocalIpAddress(ipAddress);

    return user;
  }

  /**
   * @returns {function(object, object, function)}
   */
  function createAuthMiddleware()
  {
    var anyPrivileges = [];

    for (var i = 0, l = arguments.length; i < l; ++i)
    {
      var allPrivileges = arguments[i];

      if (!Array.isArray(allPrivileges))
      {
        allPrivileges = [allPrivileges];
      }

      anyPrivileges.push(allPrivileges);
    }

    return function(req, res, next)
    {
      var user = req.session.user;

      if (!user)
      {
        user = req.session.user = createGuestData(req.socket.remoteAddress);
      }

      if (user.super)
      {
        return next();
      }

      if (!user.privileges)
      {
        return res.send(401);
      }

      for (var i = 0, l = anyPrivileges.length; i < l; ++i)
      {
        var allPrivileges = anyPrivileges[i];
        var matches = 0;

        for (var ii = 0, ll = allPrivileges.length; ii < ll; ++ii)
        {
          matches += user.privileges.indexOf(allPrivileges[ii]) === -1 ? 0 : 1;
        }

        if (matches === ll)
        {
          return next();
        }
      }

      var err = new Error('AUTH');
      err.status = 401;

      return next(err);
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

      if (typeof sessionCookie !== 'string')
      {
        handshakeData.sessionId = String(Date.now() + Math.random());
        handshakeData.user = createGuestData(handshakeData.address.address);

        return done(null, true);
      }

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
        handshakeData.user = session && session.user
          ? session.user
          : createGuestData(handshakeData.address.address);

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
        socket.handshake.user = createGuestData(socket.handshake.address.address);

        if (socket.id !== message.socketId)
        {
          socket.emit('user.reload', socket.handshake.user);
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
