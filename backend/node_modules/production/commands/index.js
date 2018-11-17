// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const unlockCommand = require('./unlockCommand');
const lockCommand = require('./lockCommand');
const syncCommand = require('./syncCommand');
const getPlannedQuantitiesCommand = require('./getPlannedQuantitiesCommand');
const joinCommand = require('./joinCommand');

module.exports = function setUpProductionCommands(app, productionModule)
{
  const sio = app[productionModule.config.sioId];

  sio.on('connection', function(socket)
  {
    socket.on('production.unlock', unlockCommand.bind(null, app, productionModule, socket));
    socket.on('production.lock', lockCommand.bind(null, app, productionModule, socket));
    socket.on('production.sync', syncCommand.bind(null, app, productionModule, socket));
    socket.on('production.getPlannedQuantities', getPlannedQuantitiesCommand.bind(null, app, productionModule, socket));
    socket.on('production.join', joinCommand.bind(null, app, productionModule, socket));
    socket.on('production.leave', leaveProductionCommand.bind(null, socket));
  });

  function leaveProductionCommand(socket, prodLineId)
  {
    const prodLineState = productionModule.getProdLineState(prodLineId);

    if (prodLineState)
    {
      prodLineState.onClientLeave(socket);
    }
  }
};
