// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function setUpSuggestionsCommands(app, module)
{
  var userModule = app[module.config.userId];
  var sio = app[module.config.sioId];
  var mongoose = app[module.config.mongooseId];
  var Suggestion = mongoose.model('Suggestion');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('suggestions.markAsSeen', markAsSeen.bind(null, socket));
    socket.on('suggestions.observe', observe.bind(null, socket));
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

    Suggestion.markAsSeen(req._id, socket.handshake.user._id, reply);
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

    Suggestion.observe(req._id, req.state, userModule.createUserInfo(user, socket), reply);
  }
};
