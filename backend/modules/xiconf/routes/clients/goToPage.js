// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function goToPageRoute(app, xiconfModule, req, res, next)
{
  var express = app[xiconfModule.config.expressId];
  var sio = app[xiconfModule.config.sioId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var XiconfClient = mongoose.model('XiconfClient');

  XiconfClient.findById(req.params.id, {socket: 1, httpPort: 1}).lean().exec(function(err, xiconfClient)
  {
    if (err)
    {
      return next(err);
    }

    if (!xiconfClient)
    {
      return next(express.createHttpError('CLIENT_NOT_FOUND', 404));
    }

    var socket = sio.sockets.connected[xiconfClient.socket];
    var remoteAddress;
    var httpPort = xiconfClient.httpPort || 1337;

    if (socket && socket.conn.remoteAddress !== '127.0.0.1')
    {
      remoteAddress = socket.conn.remoteAddress;
    }
    else
    {
      remoteAddress = xiconfClient._id.split('-')[0];
    }

    res.redirect('http://' + remoteAddress + ':' + httpPort + '/#' + (req.query.page || ''));
  });
};
