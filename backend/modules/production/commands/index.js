// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var unlockCommand = require('./unlockCommand');
var lockCommand = require('./lockCommand');
var syncCommand = require('./syncCommand');
var getPlannedQuantitiesCommand = require('./getPlannedQuantitiesCommand');

module.exports = function setUpProductionCommands(app, productionModule)
{
  var sio = app[productionModule.config.sioId];

  sio.on('connection', function(socket)
  {
    socket.on('production.unlock', unlockCommand.bind(null, app, productionModule, socket));
    socket.on('production.lock', lockCommand.bind(null, app, productionModule, socket));
    socket.on('production.sync', syncCommand.bind(null, app, productionModule, socket));
    socket.on('production.getPlannedQuantities', getPlannedQuantitiesCommand.bind(null, app, productionModule, socket));
    socket.on('production.join', joinProductionCommand.bind(null, socket));
    socket.on('production.leave', leaveProductionCommand.bind(null, socket));
  });

  function joinProductionCommand(socket, req)
  {
    if (!_.isObject(req))
    {
      return;
    }

    var prodLineState = productionModule.getProdLineState(req.prodLineId);

    if (prodLineState)
    {
      prodLineState.onClientJoin(socket, req);
    }
  }

  function leaveProductionCommand(socket, prodLineId)
  {
    var prodLineState = productionModule.getProdLineState(prodLineId);

    if (prodLineState)
    {
      prodLineState.onClientLeave(socket);
    }
  }
};
