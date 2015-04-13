// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var step = require('h5.step');

module.exports = function downloadVNCRoute(app, xiconfModule, req, res, next)
{
  var express = app[xiconfModule.config.expressId];
  var sio = app[xiconfModule.config.sioId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var XiconfClient = mongoose.model('XiconfClient');

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

      var socket = sio.sockets.connected[xiconfClient.socket];
      var remoteAddress;

      if (socket && socket.conn.remoteAddress !== '127.0.0.1')
      {
        remoteAddress = socket.conn.remoteAddress;
      }
      else
      {
        remoteAddress = xiconfClient._id.split('-')[0];
      }

      var vncFileName = req.params.id + '.vnc';
      var vncFileContents = vncTemplate
        .replace(/host\s*=.*?\r?\n/, 'host=' + remoteAddress + '\r\n')
        .trim();

      res.type('application/extension-vnc');
      res.attachment(vncFileName);
      res.end(vncFileContents);
    }
  );
};
