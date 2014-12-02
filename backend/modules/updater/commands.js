// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var exec = require('child_process').exec;

module.exports = function setUpUpdaterCommands(app, updaterModule)
{
  var sio = app[updaterModule.config.sioId];

  sio.sockets.on('connection', function(socket)
  {
    socket.emit('updater.versions', updaterModule.getVersions());

    socket.on('updater.pull', function(reply)
    {
      if (typeof reply !== 'function')
      {
        reply = function() {};
      }

      var user = socket.handshake.user;

      if (!user || !user.super)
      {
        updaterModule.warn("Unauthorized pull attempt from:", JSON.stringify(socket.handshake));

        return reply(new Error('AUTH'));
      }

      var cmd = '"' + updaterModule.config.pull.exe + '" pull';

      updaterModule.debug("Attempting a pull...");

      exec(cmd, updaterModule.config.pull, function(err, stdout, stderr)
      {
        if (err)
        {
          updaterModule.error("Failed the pull: %s", err.stack);
        }
        else if (stderr && stderr.length)
        {
          updaterModule.debug("Failed the pull :(");
        }
        else
        {
          updaterModule.debug("Pull succeeded :)");
        }

        reply(err, {stdout: stdout, stderr: stderr});
      });
    });
  });
};
