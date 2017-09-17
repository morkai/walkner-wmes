// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');

module.exports = function setUpOrderDocumentsCommands(app, module)
{
  const sio = app[module.config.sioId];
  const productionModule = app[module.config.productionId];
  const orgUnits = app[module.config.orgUnitsId];
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const OrderDocumentClient = mongoose.model('OrderDocumentClient');

  const clients = {};
  const socketToClient = {};
  const prodLineToClients = {};

  const EMPTY_REMOTE_ORDER = {
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
    const pso = changes.prodShiftOrders;

    if (pso === undefined || (_.isPlainObject(pso) && pso.orderId === undefined))
    {
      return;
    }

    updateProdLinesRemoteOrder(changes._id, null);
  }

  function onExtraDocumentsUpdated(extra)
  {
    const nameToProdLines = {};

    _.forEach(prodLineToClients, function(clientsMap, prodLineId)
    {
      const prodLineState = productionModule.getProdLineState(prodLineId);

      if (!prodLineState)
      {
        return;
      }

      const lastOrder = prodLineState.getLastOrder();

      if (!lastOrder)
      {
        return;
      }

      const name = lastOrder.orderData.name;

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

    const productNames = Object.keys(nameToProdLines);

    for (let i = 0; i < extra.length; ++i)
    {
      const pattern = extra[i].pattern;

      for (let ii = 0; ii < productNames.length; ++ii)
      {
        const productName = productNames[ii];

        if (productName.indexOf(pattern) === -1)
        {
          continue;
        }

        const prodLineIds = nameToProdLines[productName];

        for (let iii = 0; iii < prodLineIds.length; ++iii)
        {
          updateProdLinesRemoteOrder(prodLineIds[iii], null);
        }

        break;
      }
    }
  }

  function handleJoinMessage(socket, message)
  {
    const newClientId = message.clientId;
    const newProdLineId = orgUnits.fix.prodLine(message.prodLineId);

    if (!_.isString(newClientId)
      || _.isEmpty(newClientId)
      || !_.isString(newProdLineId)
      || _.isEmpty(newProdLineId))
    {
      return;
    }

    const currentClient = clients[newClientId];

    if (currentClient)
    {
      delete clients[newClientId];
      delete socketToClient[socket.id];

      if (prodLineToClients[currentClient.prodLineId])
      {
        delete prodLineToClients[currentClient.prodLineId][newClientId];
      }
    }

    const newClient = {
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

    module.debug('Client %s:', currentClient ? 'rejoined' : 'joined', {
      _id: newClient._id,
      prodLine: newClient.prodLine
    });

    updateProdLinesRemoteOrder(newProdLineId, socket);

    OrderDocumentClient.collection.update({_id: newClient._id}, newClient, {upsert: true}, function(err)
    {
      if (err)
      {
        module.error('Failed to update client [%s] after connection: %s', newClient._id, err.message);
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

    const client = clients[message.clientId];

    if (!client || socket.id !== client.socket)
    {
      return;
    }

    const update = {
      $set: {
        settings: message.settings,
        orderInfo: message.orderInfo
      }
    };

    OrderDocumentClient.collection.update({_id: message.clientId}, update, function(err)
    {
      if (err)
      {
        module.error('Failed to update client [%s]: %s', message.clientId, err.message);
      }
      else
      {
        app.broker.publish('orderDocuments.clients.updated', message);
      }
    });
  }

  function handleSocketDisconnect(socket)
  {
    const clientId = socketToClient[socket.id];

    if (!clientId)
    {
      return;
    }

    delete socketToClient[socket.id];

    const client = clients[clientId];

    if (!client)
    {
      return;
    }

    delete clients[clientId];

    if (prodLineToClients[client.prodLine])
    {
      delete prodLineToClients[client.prodLine][socket.id];
    }

    module.debug('Client disconnected:', {
      _id: clientId,
      prodLine: client.prodLine
    });

    const clientChanges = {
      _id: clientId,
      connectedAt: null,
      disconnectedAt: new Date(),
      socket: null
    };

    OrderDocumentClient.collection.update({_id: clientId, socket: socket.id}, {$set: clientChanges}, function(err)
    {
      if (err)
      {
        module.error('Failed to update client [%s] after disconnection: %s', clientId, err.message);
      }
      else
      {
        app.broker.publish('orderDocuments.clients.disconnected', clientChanges);
      }
    });
  }

  function updateProdLinesRemoteOrder(prodLineId, optSocket)
  {
    const prodLineClients = prodLineToClients[prodLineId];

    if (_.isEmpty(prodLineClients))
    {
      return;
    }

    const prodLineState = productionModule.getProdLineState(prodLineId);

    if (!prodLineState)
    {
      return emitEmptyRemoteOrderData(prodLineId, optSocket);
    }

    const lastOrder = prodLineState.getLastOrder();

    if (!lastOrder)
    {
      return emitEmptyRemoteOrderData(prodLineId, optSocket);
    }

    const lastOrderNo = lastOrder.orderData.no;

    if (!lastOrderNo)
    {
      return emitEmptyRemoteOrderData(prodLineId, optSocket);
    }

    findOrderData(lastOrderNo, function(err, orderData)
    {
      if (err)
      {
        module.error('Failed to find remote order: %s', err.message);

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

    const prodLineClients = prodLineToClients[prodLineId];

    if (_.isEmpty(prodLineClients))
    {
      return;
    }

    _.forEach(Object.keys(prodLineClients), function(clientId)
    {
      const client = clients[clientId];

      if (!client)
      {
        return;
      }

      const socket = sio.sockets.connected[client.socket];

      if (!socket)
      {
        return;
      }

      socket.emit('orderDocuments.remoteOrderUpdated', remoteOrder);
    });
  }

  function findOrderData(orderNo, done)
  {
    step(
      function findOrderStep()
      {
        Order.findById(orderNo, {name: 1, nc12: 1, documents: 1, bom: 1}).lean().exec(this.next());
      },
      function findEtoStep(err, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          return this.skip(new Error('NOT_FOUND'));
        }

        this.order = {
          no: order._id,
          nc12: order.nc12,
          name: order.name,
          documents: prepareDocumentsMap(order.name, order.documents),
          hasBom: !_.isEmpty(order.bom),
          hasEto: false
        };

        fs.stat(path.join(module.config.etoPath, order.nc12 + '.html'), this.next());
      },
      function setEtoStep(err, stats)
      {
        if (!err && stats && stats.isFile())
        {
          this.order.hasEto = true;
        }

        setImmediate(this.next(), null, this.order);
      },
      done
    );
  }

  function prepareDocumentsMap(productName, documentsList)
  {
    const documentsMap = {};

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
