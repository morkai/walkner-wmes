'use strict';

module.exports = function setUpFteCommands(app, fteModule)
{
  var masterCommands = require('./master')(app, fteModule);
  var leaderCommands = require('./leader')(app, fteModule);

  app[fteModule.config.sioId].sockets.on('connection', function(socket)
  {
    socket.on('fte.master.getCurrentEntryId', masterCommands.getCurrentEntryId.bind(null, socket));
    socket.on('fte.master.updateCount', masterCommands.updateCount.bind(null, socket));
    socket.on('fte.master.updatePlan', masterCommands.updatePlan.bind(null, socket));
    socket.on('fte.master.lockEntry', masterCommands.lockEntry.bind(null, socket));
    socket.on('fte.leader.getCurrentEntryId', leaderCommands.getCurrentEntryId.bind(null, socket));
    socket.on('fte.leader.updateCount', leaderCommands.updateCount.bind(null, socket));
    socket.on('fte.leader.lockEntry', leaderCommands.lockEntry.bind(null, socket));
  });
};
