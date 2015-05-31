// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function setUpOrderDocumentsCommands(app, module)
{
  var sio = app[module.config.sioId];
  var productionModule = app[module.config.productionId];
  var mongoose = app[module.config.mongooseId];
  var Order = mongoose.model('Order');

  var clients = {};
  var socketToClient = {};
  var prodLineToClients = {};

  var EMPTY_REMOTE_ORDER = {
    no: null,
    nc12: '',
    name: '',
    documents: {}
  };

  module.getClients = function()
  {
    return _.values(clients);
  };

  module.findOrderData = findOrderData;

  app.broker.subscribe('production.stateChanged.**', onProductionStateChanged);
  app.broker.subscribe('orderDocuments.extraUpdated', onExtraDocumentsUpdated);

  sio.on('connection', function(socket)
  {
    socket.on('disconnect', handleSocketDisconnect.bind(null, socket));
    socket.on('orderDocuments.join', handleJoinMessage.bind(null, socket));
  });

  function onProductionStateChanged(changes)
  {
    var pso = changes.prodShiftOrders;

    if (pso === undefined || (_.isPlainObject(pso) && pso.orderId === undefined))
    {
      return;
    }

    updateProdLinesRemoteOrder(changes._id, null);
  }

  function onExtraDocumentsUpdated(extra)
  {
    var nc12ToProdLines = {};

    _.forEach(prodLineToClients, function(clientsMap, prodLineId)
    {
      var prodLineState = productionModule.getProdLineState(prodLineId);

      if (!prodLineState)
      {
        return;
      }

      var lastOrder = prodLineState.getLastOrder();

      if (!lastOrder)
      {
        return;
      }

      var nc12 = lastOrder.orderData.nc12;

      if (!nc12)
      {
        return;
      }

      if (nc12ToProdLines[nc12] === undefined)
      {
        nc12ToProdLines[nc12] = [];
      }

      nc12ToProdLines[nc12].push(prodLineId);
    });

    _.forEach(extra, function(nc15s, nc12)
    {
      var prodLines = nc12ToProdLines[nc12];

      if (!prodLines)
      {
        return;
      }

      _.forEach(prodLines, function(prodLineId)
      {
        updateProdLinesRemoteOrder(prodLineId, null);
      });
    });
  }

  function handleJoinMessage(socket, message)
  {
    var newClientId = message.clientId;
    var newProdLineId = message.prodLineId;

    if (!_.isString(newClientId)
      || _.isEmpty(newClientId)
      || !_.isString(newProdLineId)
      || _.isEmpty(newProdLineId))
    {
      return;
    }

    var currentClient = clients[newClientId];

    if (currentClient)
    {
      delete clients[newClientId];
      delete socketToClient[socket.id];
      delete prodLineToClients[currentClient.prodLineId][newClientId];
    }

    var newClient = {
      _id: newClientId,
      prodLineId: newProdLineId,
      socketId: socket.id,
      ipAddress: socket.handshake.user.ipAddress,
      connectedAt: new Date()
    };

    if (!prodLineToClients[newProdLineId])
    {
      prodLineToClients[newProdLineId] = {};
    }

    clients[newClientId] = newClient;
    socketToClient[socket.id] = newClientId;
    prodLineToClients[newProdLineId][newClientId] = true;

    module.debug("Client %s:", currentClient ? 'rejoined' : 'joined', newClient);

    updateProdLinesRemoteOrder(newProdLineId, socket);
  }

  function handleSocketDisconnect(socket)
  {
    var clientId = socketToClient[socket.id];

    if (!clientId)
    {
      return;
    }

    delete socketToClient[socket.id];

    var client = clients[clientId];

    if (!client)
    {
      return;
    }

    delete clients[clientId];

    if (prodLineToClients[client.prodLineId])
    {
      delete prodLineToClients[client.prodLineId][socket.id];
    }

    module.debug("Client disconnected:", client);
  }

  function updateProdLinesRemoteOrder(prodLineId, optSocket)
  {
    var prodLineClients = prodLineToClients[prodLineId];

    if (_.isEmpty(prodLineClients))
    {
      return;
    }

    var prodLineState = productionModule.getProdLineState(prodLineId);

    if (!prodLineState)
    {
      return emitEmptyRemoteOrderData(prodLineId, optSocket);
    }

    var lastOrder = prodLineState.getLastOrder();

    if (!lastOrder)
    {
      return emitEmptyRemoteOrderData(prodLineId, optSocket);
    }

    var lastOrderNo = lastOrder.orderData.no;

    if (!lastOrderNo)
    {
      return emitEmptyRemoteOrderData(prodLineId, optSocket);
    }

    findOrderData(lastOrderNo, function(err, orderData)
    {
      if (err)
      {
        module.error("Failed to find remote order: %s", err.message);

        return emitEmptyRemoteOrderData(prodLineId, optSocket);
      }

      emitRemoteOrderData(prodLineId, optSocket, orderData);
    });
  }

  function emitEmptyRemoteOrderData(prodLineId, optSocket)
  {
    emitRemoteOrderData(prodLineId, optSocket, EMPTY_REMOTE_ORDER);
  }

  function emitRemoteOrderData(prodLineId, optSocket, remoteOrder)
  {
    if (optSocket)
    {
      return optSocket.emit('orderDocuments.remoteOrderUpdated', remoteOrder);
    }

    var prodLineClients = prodLineToClients[prodLineId];

    if (_.isEmpty(prodLineClients))
    {
      return;
    }

    _.forEach(Object.keys(prodLineClients), function(clientId)
    {
      var client = clients[clientId];

      if (!client)
      {
        return;
      }

      var socket = sio.sockets.connected[client.socketId];

      if (!socket)
      {
        return;
      }

      socket.emit('orderDocuments.remoteOrderUpdated', remoteOrder);
    });
  }

  function findOrderData(orderNo, done)
  {
    Order.findById(orderNo, {name: 1, nc12: 1, documents: 1}).lean().exec(function(err, order)
    {
      if (err)
      {
        return done(err);
      }

      if (!order)
      {
        return done(new Error('NOT_FOUND'));
      }

      return done(null, {
        no: order._id,
        nc12: order.nc12,
        name: order.name,
        documents: prepareDocumentsMap(order.nc12, order.documents)
      });
    });
  }

  function prepareDocumentsMap(nc12, documentsList)
  {
    var documentsMap = {};

    _.forEach(documentsList, function(document)
    {
      documentsMap[document.nc15] = document.name;
    });

    return _.assign(documentsMap, module.settings.extra[nc12]);
  }
};
