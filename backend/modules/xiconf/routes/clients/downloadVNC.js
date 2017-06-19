// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const step = require('h5.step');

module.exports = function downloadVNCRoute(app, xiconfModule, req, res, next)
{
  const express = app[xiconfModule.config.expressId];
  const sio = app[xiconfModule.config.sioId];
  const mongoose = app[xiconfModule.config.mongooseId];
  const XiconfClient = mongoose.model('XiconfClient');

  step(
    function()
    {
      fs.readFile(xiconfModule.config.vncTemplatePath, 'utf8', this.parallel());
      XiconfClient.findById(req.params.id, {socket: 1}).lean().exec(this.parallel());
    },
    function(err, vncTemplate, xiconfClient)
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

      if (socket && socket.conn.remoteAddress !== '127.0.0.1')
      {
        remoteAddress = socket.conn.remoteAddress;
      }
      else
      {
        remoteAddress = xiconfClient._id.split('-')[0];
      }

      const vncFileName = req.params.id + '.vnc';
      const vncFileContents = vncTemplate
        .replace('{host}', remoteAddress)
        .trim();

      res.type('application/extension-vnc');
      res.attachment(vncFileName);
      res.end(vncFileContents);
    }
  );
};
