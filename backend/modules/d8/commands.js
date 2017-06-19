// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpD8Commands(app, module)
{
  const userModule = app[module.config.userId];
  const sio = app[module.config.sioId];
  const mongoose = app[module.config.mongooseId];
  const D8Entry = mongoose.model('D8Entry');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('d8.entries.markAsSeen', markAsSeen.bind(null, socket));
    socket.on('d8.entries.observe', observe.bind(null, socket));
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

    D8Entry.markAsSeen(req._id, socket.handshake.user._id, reply);
  }

  function observe(socket, req, reply)
  {
    if (!_.isFunction(reply))
    {
      return;
    }

    const user = socket.handshake.user;

    if (!_.isObject(req)
      || !_.isString(req._id)
      || !_.isBoolean(req.state)
      || !user
      || !user.loggedIn)
    {
      return reply(new Error('INPUT'));
    }

    D8Entry.observe(req._id, req.state, userModule.createUserInfo(user, socket), reply);
  }
};
