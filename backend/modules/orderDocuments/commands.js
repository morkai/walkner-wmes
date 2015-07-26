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
  var OrderDocumentClient = mongoose.model('OrderDocumentClient');

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
    socket.on('orderDocuments.update', handleUpdateMessage.bind(null, socket));
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
    var nameToProdLines = {};

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

      var name = lastOrder.orderData.name;

      if (!name)
      {
        return;
      }

      if (nameToProdLines[name] === undefined)
      {
        nameToProdLines[name] = [];
      }

      nameToProdLines[name].push(prodLineId);
    });

    var productNames = Object.keys(nameToProdLines);

    for (var i = 0; i < extra.length; ++i)
    {
      var pattern = extra[i].pattern;

      for (var ii = 0; ii < productNames.length; ++ii)
      {
        var productName = productNames[ii];

        if (productName.indexOf(pattern) === -1)
        {
          continue;
        }

        var prodLineIds = nameToProdLines[productName];

        for (var iii = 0; iii < prodLineIds.length; ++iii)
        {
          updateProdLinesRemoteOrder(prodLineIds[iii], null);
        }

        break;
      }
    }
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
      connectedAt: new Date(),
      disconnectedAt: null,
      socket: socket.id,
      ipAddress: socket.handshake.user.ipAddress,
      prodLine: newProdLineId,
      settings: message.settings || {},
      orderInfo: message.orderInfo || {}
    };

    if (!prodLineToClients[newProdLineId])
    {
      prodLineToClients[newProdLineId] = {};
    }

    clients[newClientId] = newClient;
    socketToClient[socket.id] = newClientId;
    prodLineToClients[newProdLineId][newClientId] = true;

    module.debug("Client %s:", currentClient ? 'rejoined' : 'joined', {
      _id: newClient._id,
      prodLine: newClient.prodLine
    });

    updateProdLinesRemoteOrder(newProdLineId, socket);

    OrderDocumentClient.collection.update({_id: newClient._id}, newClient, {upsert: true}, function(err)
    {
      if (err)
      {
        module.error("Failed to update client [%s] after connection: %s", newClient._id, err.message);
      }
      else
      {
        app.broker.publish('orderDocuments.clients.connected', newClient);
      }
    });
  }

  function handleUpdateMessage(socket, message)
  {
    if (!message || !_.isString(message.clientId))
    {
      return;
    }

    var client = clients[message.clientId];

    if (!client || socket.id !== client.socket)
    {
      return;
    }

    var update = {
      $set: {
        settings: message.settings,
        orderInfo: message.orderInfo
      }
    };

    OrderDocumentClient.collection.update({_id: message.clientId}, update, function(err)
    {
      if (err)
      {
        module.error("Failed to update client [%s]: %s", message.clientId, err.message);
      }
      else
      {
        app.broker.publish('orderDocuments.clients.updated', message);
      }
    });
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

    if (prodLineToClients[client.prodLine])
    {
      delete prodLineToClients[client.prodLine][socket.id];
    }

    module.debug("Client disconnected:", {
      _id: clientId,
      prodLine: client.prodLine
    });

    var clientChanges = {
      _id: clientId,
      connectedAt: null,
      disconnectedAt: new Date(),
      socket: null
    };

    OrderDocumentClient.collection.update({_id: clientId, socket: socket.id}, {$set: clientChanges}, function(err)
    {
      if (err)
      {
        module.error("Failed to update client [%s] after disconnection: %s", clientId, err.message);
      }
      else
      {
        app.broker.publish('orderDocuments.clients.disconnected', clientChanges);
      }
    });
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

      var socket = sio.sockets.connected[client.socket];

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
        documents: prepareDocumentsMap(order.name, order.documents)
      });
    });
  }

  function prepareDocumentsMap(productName, documentsList)
  {
    var documentsMap = {};

    _.forEach(documentsList, function(document)
    {
      documentsMap[document.nc15] = document.name;
    });

    if (!_.isString(productName) || productName === '')
    {
      return documentsMap;
    }

    _.forEach(module.settings.extra, function(extra)
    {
      if ((typeof extra.pattern === 'string' && productName.indexOf(extra.pattern) !== -1)
        || (extra.pattern instanceof RegExp && extra.pattern.test(productName)))
      {
        _.assign(documentsMap, extra.documents);
      }
    });

    return documentsMap;
  }
};
