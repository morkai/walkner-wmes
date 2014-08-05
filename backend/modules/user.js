// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var os = require('os');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var lodash = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;

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
  module.getRealIp = getRealIp;
  module.isLocalIpAddress = isLocalIpAddress;
  module.isAllowedTo = isAllowedTo;
  module.createUserInfo = createUserInfo;

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
    return ipAddress === '127.0.0.1' || localAddresses.indexOf(ipAddress.replace(/\.[0-9]+$/, '')) !== -1;
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

  function isAllowedTo(user, anyPrivileges)
  {
    if (user.super)
    {
      return true;
    }

    if (anyPrivileges.length
      && user.local
      && anyPrivileges[0].some(function(privilege) { return privilege === 'LOCAL'; }))
    {
      return true;
    }

    if (!user.privileges)
    {
      return false;
    }

    if (!anyPrivileges.length)
    {
      return true;
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
        return true;
      }
    }

    return false;
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
        user = req.session.user = createGuestData(getRealIp({}, req));
      }

      if (isAllowedTo(user, anyPrivileges))
      {
        return next();
      }

      module.debug(
        "[auth] %s (%s) tried to access [%s] without sufficient privileges :(",
        user.login,
        user.ipAddress,
        req.url
      );

      return res.send(403);
    };
  }

  function createUserInfo(userData, addressData)
  {
    /**
     * @name UserInfo
     * @type {{id: string, ip: string, label: string}}
     */
    var userInfo = {
      id: null,
      ip: '',
      label: ''
    };

    try
    {
      userInfo.id = ObjectId.createFromHexString(String(userData._id || userData.id));
    }
    catch (err) {}

    if (typeof userData.label === 'string')
    {
      userInfo.label = userData.label;
    }
    else if (userData.firstName && userData.lastName)
    {
      userInfo.label = userData.lastName + ' ' + userData.firstName;
    }
    else
    {
      userInfo.label = userData.login || '?';
    }

    userInfo.ip = getRealIp(userData, addressData);

    return userInfo;
  }

  function getRealIp(userData, addressData)
  {
    var ip = '';

    if (addressData)
    {
      if (hasRealIpFromProxyServer(addressData))
      {
        ip = addressData.headers['x-real-ip'];
      }
      else if (addressData.socket && typeof addressData.socket.remoteAddress === 'string')
      {
        ip = addressData.socket.remoteAddress;
      }
      else if (addressData.handshake)
      {
        ip = getRealIp(userData, addressData.handshake);

        if (ip === '0.0.0.0' && addressData.handshake.address && addressData.handshake.address.address)
        {
          ip = addressData.handshake.address.address;
        }
      }
    }

    if (ip === '')
    {
      ip = userData.ip || userData.ipAddress || '0.0.0.0';
    }

    return ip;
  }

  function hasRealIpFromProxyServer(addressData)
  {
    if (!addressData.headers || typeof addressData.headers['x-real-ip'] !== 'string')
    {
      return false;
    }

    if (addressData.socket && addressData.socket.remoteAddress === '127.0.0.1')
    {
      return true;
    }

    var handshake = addressData.handshake;

    if (handshake && handshake.address && handshake.address.address === '127.0.0.1')
    {
      return true;
    }

    return false;
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
        handshakeData.user = createGuestData(getRealIp({}, handshakeData));

        return done(null, true);
      }

      var sessionId = cookieParser.signedCookie(sessionCookie, express.config.cookieSecret);

      express.sessionStore.get(sessionId, function(err, session)
      {
        if (err)
        {
          return done(err);
        }

        handshakeData.sessionId = sessionId;
        handshakeData.user = session && session.user
          ? session.user
          : createGuestData(getRealIp({}, handshakeData));

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
        socket.handshake.user = createGuestData(getRealIp({}, socket));

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
