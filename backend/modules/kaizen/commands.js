// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpKaizenCommands(app, kaizenModule)
{
  var userModule = app[kaizenModule.config.userId];
  var sio = app[kaizenModule.config.sioId];
  var mongoose = app[kaizenModule.config.mongooseId];
  var KaizenOrder = mongoose.model('KaizenOrder');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('kaizen.markAsSeen', markAsSeen.bind(null, socket));
    socket.on('kaizen.observe', observe.bind(null, socket));
  });

  function markAsSeen(socket, req, reply)
  {
    if (!_.isFunction(reply))
    {
      return;
    }

    if (!_.isObject(req) || !_.isString(req._id))
    {
      return reply(new Error('INPUT'));
    }

    KaizenOrder.markAsSeen(req._id, socket.handshake.user._id, reply);
  }

  function observe(socket, req, reply)
  {
    if (!_.isFunction(reply))
    {
      return;
    }

    var user = socket.handshake.user;

    if (!_.isObject(req)
      || !_.isString(req._id)
      || !_.isBoolean(req.state)
      || !user
      || !user.loggedIn)
    {
      return reply(new Error('INPUT'));
    }

    KaizenOrder.observe(req._id, req.state, userModule.createUserInfo(user, socket), reply);
  }
};
