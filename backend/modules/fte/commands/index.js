// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpFteCommands(app, fteModule)
{
  var masterCommands = require('./master')(app, fteModule);
  var leaderCommands = require('./leader')(app, fteModule);

  app[fteModule.config.sioId].sockets.on('connection', function(socket)
  {
    socket.on('fte.master.findOrCreate', masterCommands.findOrCreate.bind(null, socket));
    socket.on('fte.master.updateCount', masterCommands.updateCount.bind(null, socket));
    socket.on('fte.master.updatePlan', masterCommands.updatePlan.bind(null, socket));
    socket.on('fte.master.addAbsentUser', masterCommands.addAbsentUser.bind(null, socket));
    socket.on('fte.master.removeAbsentUser', masterCommands.removeAbsentUser.bind(null, socket));
    socket.on('fte.leader.findOrCreate', leaderCommands.findOrCreate.bind(null, socket));
    socket.on('fte.leader.updateCount', leaderCommands.updateCount.bind(null, socket));
  });
};
