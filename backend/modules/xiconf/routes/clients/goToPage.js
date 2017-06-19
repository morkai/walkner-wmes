// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function goToPageRoute(app, xiconfModule, req, res, next)
{
  const express = app[xiconfModule.config.expressId];
  const sio = app[xiconfModule.config.sioId];
  const mongoose = app[xiconfModule.config.mongooseId];
  const XiconfClient = mongoose.model('XiconfClient');

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

    const socket = sio.sockets.connected[xiconfClient.socket];
    let remoteAddress;
    const httpPort = xiconfClient.httpPort || 1337;

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
