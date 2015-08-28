// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');

module.exports = function setUpXiconfCommands(app, xiconfModule)
{
  var WORKING_ORDER_CHANGE_CHECK_DELAY = 15 * 60 * 1000;
  var WORKING_ORDER_CHANGE_CHECK_NEAR_SHIFT_CHANGE_MINUTES = 15;
  var FT_PROGRAM_ID = '__FT__';

  var sio = app[xiconfModule.config.sioId];
  var productionModule = app[xiconfModule.config.productionId];
  var settingsModule = app[xiconfModule.config.settingsId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var XiconfClient = mongoose.model('XiconfClient');
  var XiconfResult = mongoose.model('XiconfResult');
  var XiconfOrderResult = mongoose.model('XiconfOrderResult');
  var XiconfOrder = mongoose.model('XiconfOrder');
  var Order = mongoose.model('Order');
  var License = mongoose.model('License');

  var prodLinesToDataMap = {};
  var ordersToDataMap = {};
  var ordersToProdLinesMap = {};
  var ordersToGetOrderDataQueueMap = {};
  var ordersToOperationsQueueMap = {};
  var ordersLocks = {};
  var workingOrderChangeCheckTimers = {};

  var debugMode = false;
  var orderResultsRecountLock = false;
  var orderResultsToRecount = {};
  var orderResultsRecountTimer = null;

  xiconfModule.getRemoteCoordinatorDebugInfo = function(enableDebugMode)
  {
    debugMode = enableDebugMode === true;

    var cleanProdLinesToDataMap = {};

    _.forEach(prodLinesToDataMap, function(prodLineData, prodLineId)
    {
      cleanProdLinesToDataMap[prodLineId] = {
        leader: prodLineData.leader,
        orders: prodLineData.orders,
        sockets: Object.keys(prodLineData.sockets)
      };
    });

    return {
      debugMode: debugMode,
      prodLinesToDataMap: cleanProdLinesToDataMap,
      ordersToProdLinesMap: ordersToProdLinesMap,
      ordersToGetOrderDataQueueMap: ordersToGetOrderDataQueueMap,
      ordersToOperationsQueueMap: ordersToOperationsQueueMap,
      ordersLocks: ordersLocks,
      orderResultsRecountLock: orderResultsRecountLock,
      orderResultsToRecount: orderResultsToRecount,
      workingOrderChangeCheckTimers: Object.keys(workingOrderChangeCheckTimers),
      ordersToDataMap: ordersToDataMap
    };
  };

  app.broker.subscribe('app.started', onAppStarted);
  app.broker.subscribe('settings.updated.xiconf.notifier.delay', onDelaySettingChanged);
  app.broker.subscribe('shiftChanged', onShiftChanged);
  app.broker.subscribe('xiconf.orders.synced', onXiconfOrdersSynced);
  app.broker.subscribe('xiconf.results.synced', onXiconfResultsSynced);
  app.broker.subscribe('production.stateChanged.**', onProductionStateChanged);
  app.broker.subscribe('licenses.edited', onLicenseEdited);

  sio.sockets.on('connection', function(socket)
  {
    socket.on('disconnect', handleClientDisconnect);
    socket.on('xiconf.connect', handleClientConnect);
    socket.on('xiconf.checkSerialNumber', handleCheckSerialNumberRequest);
    socket.on('xiconf.generateServiceTag', handleGenerateServiceTagRequest);
    socket.on('xiconf.acquireServiceTag', handleAcquireServiceTagRequest);
    socket.on('xiconf.releaseServiceTag', handleReleaseServiceTagRequest);
    socket.on('xiconf.stateChanged', onClientsStateChanged);
    socket.on('xiconf.restart', handleRestartRequest);
    socket.on('xiconf.update', handleUpdateRequest);
    socket.on('xiconf.configure', handleConfigureRequest);
  });

  function onAppStarted()
  {
    settingsModule.findById('xiconf.notifier.delay', function(err, setting)
    {
      if (err)
      {
        return xiconfModule.error("Failed to read the delay setting: %s", err.message);
      }

      if (setting)
      {
        onDelaySettingChanged(setting);
      }
    });
  }

  function onDelaySettingChanged(message)
  {
    var delay = +message.value;

    if (isNaN(delay))
    {
      delay = 15;
    }
    else if (delay < 1)
    {
      delay = 1;
    }
    else if (delay > 30)
    {
      delay = 30;
    }

    WORKING_ORDER_CHANGE_CHECK_DELAY = delay * 60 * 1000;
  }

  function handleRestartRequest(data)
  {
    if (_.isObject(data) && _.isString(data.socket) && sio.sockets.connected[data.socket])
    {
      sio.sockets.connected[data.socket].emit('xiconf.restart');
    }
  }

  function handleUpdateRequest(data)
  {
    if (_.isObject(data) && _.isString(data.socket) && sio.sockets.connected[data.socket])
    {
      sio.sockets.connected[data.socket].emit('xiconf.update');
    }
  }

  function handleConfigureRequest(data, reply)
  {
    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (_.isObject(data)
      && _.isString(data.socket) && sio.sockets.connected[data.socket]
      && _.isObject(data.settings) && !_.isEmpty(data.settings))
    {
      sio.sockets.connected[data.socket].emit('xiconf.configure', data.settings, reply);
    }
    else
    {
      reply(new Error('INPUT'));
    }
  }

  function onProductionStateChanged(changes)
  {
    var ps = changes.prodShift;

    if (ps !== undefined && (ps === null || ps.leader !== undefined))
    {
      updateProdLinesLeader(changes._id, null);
    }

    var pso = changes.prodShiftOrders;

    if (pso === undefined || (_.isPlainObject(pso) && pso.orderId === undefined))
    {
      return;
    }

    updateProdLinesRemoteData(changes._id, null);
  }

  function onShiftChanged()
  {
    cleanUpOrders();
  }

  function onLicenseEdited(message)
  {
    var licenseId = message.model._id;
    var licenseKey = message.model.key;

    XiconfClient.find({license: licenseId, socket: {$ne: null}}, {socket: 1}).lean().exec(function(err, xiconfClients)
    {
      if (err)
      {
        return xiconfModule.error("Failed find a client on license edit: %s", err.message);
      }

      if (!xiconfClients.length)
      {
        return;
      }

      _.forEach(xiconfClients, function(xiconfClient)
      {
        handleConfigureRequest({socket: xiconfClient.socket, settings: {licenseKey: licenseKey}}, function(err)
        {
          if (err)
          {
            return xiconfModule.error("Failed to update the client's license key on license edit: %s", err.message);
          }
        });
      });
    });
  }

  function onXiconfOrdersSynced(message)
  {
    step(
      function findUpdatedXiconfOrdersStep()
      {
        var condition = {
          _id: {$in: Object.keys(ordersToDataMap)},
          importedAt: new Date(message.timestamp)
        };

        XiconfOrder.find(condition, {_id: 1}).lean().exec(this.next());
      },
      function removeUpdatedXiconfOrdersStep(err, updatedXiconfOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.orderNos = [];

        for (var i = 0; i < updatedXiconfOrders.length; ++i)
        {
          var orderNo = updatedXiconfOrders[i]._id;

          delete ordersToDataMap[orderNo];

          this.orderNos.push(orderNo);
        }

        setImmediate(this.next());
      },
      function recountOrdersStep()
      {
        for (var i = 0; i < this.orderNos.length; ++i)
        {
          recountOrder({orderNo: this.orderNos[i]});
        }
      },
      function finalizeStep(err)
      {
        if (err)
        {
          return xiconfModule.error("Failed to remove cached order data after orders were synced: %s", err.message);
        }
      }
    );
  }

  function onXiconfResultsSynced(message)
  {
    var orderResultIds = message.orders;

    if (!orderResultIds.length)
    {
      return;
    }

    for (var i = 0; i < orderResultIds.length; ++i)
    {
      orderResultsToRecount[orderResultIds[i]] = true;
    }

    if (orderResultsRecountLock)
    {
      return;
    }

    if (orderResultsRecountTimer !== null)
    {
      clearTimeout(orderResultsRecountTimer);
    }

    orderResultsRecountTimer = setTimeout(recountOrderResults, 1337);
  }

  function recountOrderResults()
  {
    if (orderResultsRecountTimer !== null)
    {
      clearTimeout(orderResultsRecountTimer);
      orderResultsRecountTimer = null;
    }

    if (orderResultsRecountLock)
    {
      return;
    }

    var orderResultIds = Object.keys(orderResultsToRecount);

    if (!orderResultIds.length)
    {
      return;
    }

    orderResultsToRecount = {};
    orderResultsRecountLock = true;

    step(
      function findXiconfOrderResultsStep()
      {
        XiconfOrderResult.find({_id: {$in: orderResultIds}}, {_id: 0, no: 1}).lean().exec(this.next());
      },
      function mapOrderNosStep(err, xiconfOrderResults)
      {
        if (err)
        {
          return this.skip(err);
        }

        var orderNos = {};

        for (var i = 0; i < xiconfOrderResults.length; ++i)
        {
          orderNos[xiconfOrderResults[i].no] = true;
        }

        this.orderNos = Object.keys(orderNos);

        setImmediate(this.next());
      },
      function findXiconfResultsStep()
      {
        var conditions = {
          orderNo: {$in: this.orderNos},
          serviceTag: null,
          result: 'success'
        };
        var fields = {
          orderNo: 1,
          nc12: 1,
          workflow: 1,
          leds: 1,
          program: 1
        };

        XiconfResult.find(conditions, fields).lean().exec(this.next());
      },
      function acquireServiceTagsStep(err, xiconfResults)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (xiconfResults.length === 0)
        {
          return this.skip();
        }

        for (var i = 0; i < xiconfResults.length; ++i)
        {
          var xiconfResult = xiconfResults[i];
          var input = {
            serviceTag: null,
            orderNo: xiconfResult.orderNo,
            nc12: xiconfResult.nc12,
            multi: isMultiDeviceResult(xiconfResult),
            leds: createLedsFromXiconfResult(xiconfResult.leds),
            programId: xiconfResult.program ? xiconfResult.program._id : null,
            programName: xiconfResult.program ? xiconfResult.program.name : null,
            recount: false
          };

          acquireServiceTag(input, this.group());
        }

        this.xiconfResults = xiconfResults;
      },
      function updateServiceTagsStep(err, serviceTags)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < this.xiconfResults.length; ++i)
        {
          var xiconfResult = this.xiconfResults[i];
          var serviceTag = serviceTags[i];

          if (!serviceTag)
          {
            continue;
          }

          XiconfResult.collection.update({_id: xiconfResult._id}, {$set: {serviceTag: serviceTag}}, this.group());
        }
      },
      function recountOrdersStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < this.orderNos.length; ++i)
        {
          recountOrder({orderNo: this.orderNos[i]}, this.group());
        }
      },
      function finalizeStep(err)
      {
        if (err)
        {
          xiconfModule.error("Failed to recount orders after results sync: %s", err.message);
        }

        orderResultsRecountLock = false;

        setImmediate(recountOrderResults);
      }
    );
  }

  function onClientsStateChanged(newState)
  {
    /*jshint validthis:true*/

    var socket = this;

    if (!socket.xiconf || !_.isPlainObject(newState))
    {
      return;
    }

    newState = _.pick(newState, ['order', 'inputMode']);

    if (_.isEmpty(newState))
    {
      return;
    }

    XiconfClient.collection.update({_id: socket.xiconf.srcId}, {$set: newState}, function(err)
    {
      if (err)
      {
        return xiconfModule.error(
          "Failed to update client [%s] after changing state: %s",
          socket.xiconf.srcId,
          err.message
        );
      }

      newState._id = socket.xiconf.srcId;

      app.broker.publish('xiconf.clients.stateChanged', newState);
    });
  }

  function handleClientDisconnect()
  {
    /*jshint validthis:true*/

    var socket = this;

    if (!socket.xiconf)
    {
      return;
    }

    if (socket.xiconf.prodLineId !== null)
    {
      var prodLineData = prodLinesToDataMap[socket.xiconf.prodLineId];

      if (!prodLineData)
      {
        return;
      }

      if (!prodLineData.sockets[socket.id])
      {
        return;
      }

      delete prodLineData.sockets[socket.id];
    }

    var clientId = socket.xiconf.srcId;

    xiconfModule.debug("[%s] disconnected from [%s] (socket=[%s])", clientId, socket.xiconf.prodLineId, socket.id);

    delete socket.xiconf;

    var clientChanges = {
      _id: clientId,
      connectedAt: null,
      disconnectedAt: new Date(),
      socket: null
    };

    XiconfClient.collection.update({_id: clientId, socket: socket.id}, {$set: clientChanges}, function(err)
    {
      if (err)
      {
        xiconfModule.error("Failed to update client [%s] after disconnection: %s", clientId, err.message);
      }
      else
      {
        app.broker.publish('xiconf.clients.disconnected', clientChanges);
      }
    });
  }

  function handleClientConnect(data)
  {
    /*jshint validthis:true*/

    var socket = this;

    if (!_.isObject(data) || !_.isString(data.srcId) || _.isEmpty(data.srcId))
    {
      return;
    }

    if (!_.isString(data.prodLineId) || _.isEmpty(data.prodLineId))
    {
      data.prodLineId = null;
    }

    if (!socket.xiconf)
    {
      socket.xiconf = {
        srcId: null,
        prodLineId: null
      };
    }

    var reconnected = false;

    if (socket.xiconf.prodLineId !== null)
    {
      if (data.prodLineId !== socket.xiconf.prodLineId)
      {
        delete getProdLineData(socket.xiconf.prodLineId).sockets[socket.id];

        xiconfModule.warn(
          "[%s] changed prod line from [%s] to [%s] (socket=[%s])",
          data.srcId,
          socket.xiconf.prodLineId,
          data.prodLineId,
          socket.id
        );
      }
      else
      {
        reconnected = true;
      }
    }
    else
    {
      xiconfModule.info("[%s] connected to [%s] (socket=[%s])", data.srcId, data.prodLineId, socket.id);
    }

    socket.xiconf.srcId = data.srcId;
    socket.xiconf.prodLineId = data.prodLineId;

    if (data.prodLineId !== null)
    {
      var prodLineData = getProdLineData(data.prodLineId);

      prodLineData.sockets[socket.id] = socket;

      updateProdLinesRemoteData(data.prodLineId, socket);
      updateProdLinesLeader(data.prodLineId, socket);
    }

    if (reconnected)
    {
      return;
    }

    var xiconfClient = {
      _id: data.srcId,
      connectedAt: new Date(),
      disconnectedAt: null,
      httpPort: data.httpPort || 1337,
      socket: socket.id,
      prodLine: data.prodLineId,
      license: data.licenseId || null,
      licenseError: data.licenseError || null,
      order: data.selectedOrderNo || null,
      appVersion: data.appVersion || '0.0.0',
      mowVersion: data.mowVersion || '0.0.0.0',
      coreScannerDriver: data.coreScannerDriver === true,
      inputMode: data.inputMode || 'remote'
    };

    XiconfClient.collection.update({_id: xiconfClient._id}, xiconfClient, {upsert: true}, function(err)
    {
      if (err)
      {
        xiconfModule.error("Failed to update client [%s] after connection: %s", xiconfClient._id, err.message);
      }
      else
      {
        app.broker.publish('xiconf.clients.connected', xiconfClient);
      }
    });

    checkClientsLicenseKey(xiconfClient.socket, xiconfClient.license, data.licenseKey);
  }

  function handleCheckSerialNumberRequest(input, reply)
  {
    /*jshint validthis:true*/

    var socket = this;

    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (!socket.xiconf)
    {
      return reply(new Error('NOT_CONNECTED'));
    }

    if (!_.isObject(input)
      || !_.isString(input.orderNo)
      || !_.isString(input.nc12)
      || !_.isString(input.serialNumber))
    {
      return reply(new Error('INPUT'));
    }

    checkSerialNumber(input, reply);
  }

  function handleGenerateServiceTagRequest(input, reply)
  {
    /*jshint validthis:true*/

    var socket = this;

    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (!socket.xiconf)
    {
      return reply(new Error('NOT_CONNECTED'));
    }

    if (!_.isObject(input)
      || !_.isString(input.orderNo)
      || !_.isString(input.nc12)
      || !validateInputLeds(input))
    {
      return reply(new Error('INPUT'));
    }

    generateServiceTag(input, reply);
  }

  function handleAcquireServiceTagRequest(input, reply)
  {
    /*jshint validthis:true*/

    var socket = this;

    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (!socket.xiconf)
    {
      return reply(new Error('NOT_CONNECTED'));
    }

    if (!_.isObject(input)
      || !_.isString(input.orderNo)
      || !_.isString(input.nc12)
      || !_.isBoolean(input.multi)
      || !validateInputLeds(input))
    {
      return reply(new Error('INPUT'));
    }

    if (!_.isString(input.serviceTag))
    {
      input.serviceTag = null;
    }
    else if (!/^P[0-9]{17}$/.test(input.serviceTag))
    {
      return reply(new Error('INPUT'));
    }

    if (!_.isString(input.programId)
      || _.isEmpty(input.programId)
      || !_.isString(input.programName)
      || _.isEmpty(input.programName))
    {
      input.programId = null;
      input.programName = null;
    }

    acquireServiceTag(input, reply);
  }

  function handleReleaseServiceTagRequest(input, reply)
  {
    /*jshint validthis:true*/

    var socket = this;

    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (!socket.xiconf)
    {
      return reply(new Error('NOT_CONNECTED'));
    }

    if (!_.isObject(input)
      || !_.isString(input.serviceTag)
      || !_.isString(input.orderNo)
      || !_.isString(input.nc12)
      || !_.isBoolean(input.multi)
      || !validateInputLeds(input))
    {
      return reply(new Error('INPUT'));
    }

    if (!_.isString(input.programId)
      || _.isEmpty(input.programId)
      || !_.isString(input.programName)
      || _.isEmpty(input.programName))
    {
      input.programId = null;
      input.programName = null;
    }

    releaseServiceTag(input, reply);
  }

  function validateInputLeds(input)
  {
    if (!_.isArray(input.leds))
    {
      input.leds = [];
    }

    for (var i = 0; i < input.leds.length; ++i)
    {
      var led = input.leds[i];

      if (!_.isObject(led) || !_.isString(led.nc12) || !_.isArray(led.serialNumbers) || !led.serialNumbers.length)
      {
        return false;
      }

      for (var ii = 0; ii < led.serialNumbers.length; ++ii)
      {
        var serialNumber = led.serialNumbers[ii];

        if (!_.isString(serialNumber) || _.isEmpty(serialNumber))
        {
          return false;
        }
      }
    }

    return true;
  }

  function checkSerialNumber(input, reply)
  {
    step(
      function findXiconfOrderStep()
      {
        XiconfOrder
          .findOne(
            {'items.serialNumbers': input.serialNumber, _id: input.orderNo},
            {'items.serialNumbers': 0}
          )
          .lean()
          .exec(this.next());
      },
      function checkStep(err, snOrder)
      {
        if (err)
        {
          xiconfModule.error(
            "Failed to check serial number [%s] for order [%s] and 12NC [%s]: %s",
            err.message,
            input.serialNumber,
            input.orderNo,
            input.nc12
          );

          return reply(new Error('DB_FAILURE'), null);
        }

        if (snOrder)
        {
          return reply(new Error('SERIAL_NUMBER_USED'), snOrder);
        }

        return reply(null, null);
      }
    );
  }

  function recountOrder(input, reply)
  {
    queueOrderOperation(input.orderNo, recountNextOrder, reply, {
      orderNo: input.orderNo
    });
  }

  function generateServiceTag(input, reply)
  {
    queueOrderOperation(input.orderNo, generateNextServiceTag, reply, {
      orderNo: input.orderNo,
      nc12: input.nc12,
      leds: input.leds
    });
  }

  function acquireServiceTag(input, reply)
  {
    queueOrderOperation(input.orderNo, acquireNextServiceTag, reply, {
      serviceTag: input.serviceTag,
      orderNo: input.orderNo,
      nc12: input.nc12,
      multi: input.multi,
      leds: input.leds,
      programId: input.programId,
      programName: input.programName,
      recount: input.recount !== false
    });
  }

  function releaseServiceTag(input, reply)
  {
    queueOrderOperation(input.orderNo, releaseNextServiceTag, reply, {
      serviceTag: input.serviceTag,
      orderNo: input.orderNo,
      nc12: input.nc12,
      multi: input.multi,
      leds: input.leds,
      programId: input.programId,
      programName: input.programName
    });
  }

  function queueOrderOperation(orderNo, operation, reply, data)
  {
    var orderQueue = ordersToOperationsQueueMap[orderNo];
    var queueItem = {
      operation: operation,
      reply: reply || function() {},
      data: data
    };

    if (ordersLocks[orderNo])
    {
      return orderQueue.push(queueItem);
    }

    ordersToOperationsQueueMap[orderNo] = [queueItem];

    execNextOrderOperation(orderNo);
  }

  function execNextOrderOperation(orderNo)
  {
    if (ordersLocks[orderNo])
    {
      return;
    }

    var orderQueue = ordersToOperationsQueueMap[orderNo];

    if (!Array.isArray(orderQueue))
    {
      return;
    }

    var queueItem = orderQueue.shift();

    if (!queueItem)
    {
      delete ordersToOperationsQueueMap[orderNo];
      delete ordersLocks[orderNo];

      return;
    }

    ordersLocks[orderNo] = true;

    queueItem.operation(queueItem.data, function(err, result)
    {
      delete ordersLocks[orderNo];

      queueItem.reply(err, result);
    });
  }

  function recountNextOrder(data, done)
  {
    step(
      function getDataStep()
      {
        getOrderData(data.orderNo, this.parallel());

        XiconfResult
          .find({orderNo: data.orderNo, serviceTag: null, result: 'success'}, {nc12: 1, workflow: 1, program: 1})
          .lean()
          .exec(this.parallel());
      },
      function recountStep(err, orderData, xiconfResults)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderData)
        {
          return this.skip(new Error('ORDER_NOT_FOUND'));
        }

        var i;
        var nc12ToResults = {};
        var testResults = {};

        for (i = 0; i < xiconfResults.length; ++i)
        {
          var xiconfResult = xiconfResults[i];
          var program = xiconfResult.program;
          var nc12Results = nc12ToResults[xiconfResult.nc12];

          if (!nc12Results)
          {
            nc12Results = nc12ToResults[xiconfResult.nc12] = {
              single: 0,
              multi: 0
            };
          }

          if (isMultiDeviceResult(xiconfResult))
          {
            nc12Results.multi += 1;
          }
          else
          {
            nc12Results.single += 1;
          }

          if (program)
          {
            if (!testResults[program._id])
            {
              testResults[program._id] = {
                quantity: 0,
                programName: program.name
              };
            }

            testResults[program._id].quantity += 1;
          }
        }

        var quantityPerResult = 0;
        var programQuantityDone = 0;
        var ledQuantityDone = 0;
        var testQuantityDone = 0;
        var ftQuantityDone = 0;
        var programItems = [];
        var ledItems = [];
        var testItems = {};
        var ftItem = null;
        var ftItemIndex = -1;
        var itemChanges = [];
        var newItems = [];

        for (i = 0; i < orderData.items.length; ++i)
        {
          var item = orderData.items[i];

          if (item.kind === 'led')
          {
            ledItems.push(item);
          }
          else if (item.kind === 'program')
          {
            programItems.push({item: item, index: i});
          }
          else if (item.kind === 'test')
          {
            testItems[item.nc12] = {item: item, index: i};
          }
          else if (item.kind === 'ft')
          {
            ftItem = item;
            ftItemIndex = i;
          }
        }

        var nextItemIndex = orderData.items.length;

        _.forEach(testResults, function(testResult, programId)
        {
          if (programId === FT_PROGRAM_ID)
          {
            if (ftItem)
            {
              itemChanges.push({
                index: ftItemIndex,
                extraQuantityDone: testResult.quantity
              });

              return;
            }

            ftItem = {
              kind: 'ft',
              nc12: programId,
              name: testResult.programName,
              quantityTodo: orderData.quantityTodo,
              quantityDone: 0,
              extraQuantityDone: testResult.quantity,
              serialNumbers: []
            };
            ftItemIndex = nextItemIndex++;

            newItems.push(ftItem);

            return;
          }

          var testItem = testItems[programId];

          if (testItem)
          {
            itemChanges.push({
              index: testItem.index,
              extraQuantityDone: testResult.quantity
            });

            return;
          }

          testItems[programId] = {
            item: {
              kind: 'test',
              nc12: programId,
              name: testResult.programName,
              quantityTodo: orderData.quantityTodo,
              quantityDone: 0,
              extraQuantityDone: testResult.quantity,
              serialNumbers: []
            },
            index: nextItemIndex++
          };

          newItems.push(testItems[programId].item);
        });

        var anyLedItems = ledItems.length > 0;

        if (anyLedItems)
        {
          quantityPerResult = ledItems[0].quantityTodo / orderData.quantityTodo;
          ledQuantityDone = ledItems[0].quantityDone / quantityPerResult;
        }

        for (i = 0; i < programItems.length; ++i)
        {
          var programItem = programItems[i].item;
          var programItemIndex = programItems[i].index;
          var programItemQuantityDone = programItem.quantityDone;
          var results = nc12ToResults[programItem.nc12];

          quantityPerResult = programItem.quantityTodo / orderData.quantityTodo;

          if (results)
          {
            var extraQuantityDone = results.single + results.multi * quantityPerResult;

            programItemQuantityDone += extraQuantityDone;

            itemChanges.push({
              index: programItemIndex,
              extraQuantityDone: extraQuantityDone
            });
          }

          programQuantityDone += programItemQuantityDone / quantityPerResult;
        }

        _.forEach(testItems, function(testItem)
        {
          testQuantityDone += testItem.item.quantityDone + testItem.item.extraQuantityDone;
        });

        if (ftItem)
        {
          ftQuantityDone = ftItem.quantityDone + ftItem.extraQuantityDone;
        }

        var quantityDone = 0;

        if (orderData.items.length === 0)
        {
          quantityDone = orderData.quantityDone;
        }
        else
        {
          var quantitiesDone = [programQuantityDone, ledQuantityDone, testQuantityDone, ftQuantityDone]
            .filter(function(qty) { return qty > 0; });
          var totalQuantityDone = quantitiesDone.reduce(function(qty, total) { return qty + total; }, 0);

          quantityDone = Math.round(totalQuantityDone / quantitiesDone.length * 100) / 100;
        }

        var changes = {
          quantityDone: quantityDone,
          status: quantityDone < orderData.quantityTodo ? -1 : quantityDone > orderData.quantityTodo ? 1 : 0
        };

        if (orderData.startedAt === null && changes.quantityDone > 0)
        {
          changes.startedAt = new Date();
        }

        if (orderData.finishedAt === null && changes.status !== -1)
        {
          changes.finishedAt = new Date();
        }
        else if (orderData.finishedAt !== null && changes.status === -1)
        {
          changes.finishedAt = null;
        }

        var condition = {_id: data.orderNo};
        var updates = {
          $set: _.clone(changes)
        };

        for (i = 0; i < itemChanges.length; ++i)
        {
          var itemChange = itemChanges[i];

          updates.$set['items.' + itemChange.index + '.extraQuantityDone'] = itemChange.extraQuantityDone;
        }

        for (i = 0; i < newItems.length; ++i)
        {
          updates.$set['items.' + (orderData.items.length + i)] = newItems[i];
        }

        XiconfOrder.collection.update(condition, updates, this.next());

        this.orderData = orderData;
        this.changes = changes;
        this.itemChanges = itemChanges;
        this.newItems = newItems;
      },
      function applyChangesStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        _.merge(this.orderData, this.changes);

        for (var i = 0; i < this.itemChanges.length; ++i)
        {
          var itemChange = this.itemChanges[i];

          this.orderData.items[itemChange.index].extraQuantityDone = itemChange.extraQuantityDone;
        }

        if (this.newItems.length)
        {
          this.orderData.items = this.orderData.items.concat(this.newItems);
        }
      },
      function(err)
      {
        if (err)
        {
          xiconfModule.error("Failed to recount order [%s]: %s", data.orderNo, err.message);
        }
        else
        {
          this.changes._id = data.orderNo;

          app.broker.publish('xiconf.orders.' + data.orderNo + '.recounted', {
            orderNo: data.orderNo,
            quantityDone: this.orderData.quantityDone
          });

          debug('[recountNextOrder] orderNo=%s quantityDone=%d', data.orderNo, this.orderData.quantityDone);

          setImmediate(emitRemoteDataToOrderWorkers, data.orderNo);
        }

        setImmediate(execNextOrderOperation, data.orderNo);

        this.orderData = null;
        this.changes = null;
        this.itemChanges = null;
        this.newItems = null;

        done(err);
      }
    );
  }

  function generateNextServiceTag(data, done)
  {
    step(
      function getOrderDataStep()
      {
        getOrderData(data.orderNo, this.next());
      },
      function generateServiceTagStep(err, orderData)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderData)
        {
          return this.skip(new Error('ORDER_NOT_FOUND'));
        }

        if (orderData.serviceTagCounter === 9999)
        {
          return this.skip(new Error('NO_FREE_SERVICE_TAGS'));
        }

        var $set = {
          serviceTagCounter: orderData.serviceTagCounter + 1
        };
        var changes = [
          function(orderData) { orderData.serviceTagCounter = $set.serviceTagCounter; }
        ];

        var condition = {_id: data.orderNo};
        var updates = {$set: $set};

        XiconfOrder.collection.update(condition, updates, this.next());

        this.orderData = orderData;
        this.changes = changes;
      },
      function applyChangesStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        applyOrderDataChanges(this.orderData, this.changes);

        return this.skip(null, buildServiceTag(this.orderData._id, this.orderData.serviceTagCounter));
      },
      function replyStep(err, serviceTag)
      {
        if (err)
        {
          xiconfModule.error("Failed to generate a new Service Tag for order [%s]: %s", data.orderNo, err.message);

          setImmediate(execNextOrderOperation, data.orderNo);
        }
        else
        {
          app.broker.publish('xiconf.orders.' + data.orderNo + '.serviceTagGenerated', {
            orderNo: data.orderNo,
            serviceTag: serviceTag
          });

          setImmediate(execNextOrderOperation, data.orderNo);
        }

        this.orderData = null;
        this.changes = null;

        done(err, _.isString(serviceTag) ? serviceTag : null);
      }
    );
  }

  function acquireNextServiceTag(data, done)
  {
    step(
      function getOrderDataStep()
      {
        getOrderData(data.orderNo, this.next());
      },
      function updateXiconfOrderStep(err, orderData)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderData)
        {
          return this.skip(new Error('ORDER_NOT_FOUND'));
        }

        if (orderData.serviceTagCounter === 9999)
        {
          return this.skip(new Error('NO_FREE_SERVICE_TAGS'));
        }

        var programItem;
        var programItemIndex = -1;
        var testItem;
        var testItemIndex = -1;
        var ftItem;
        var ftItemIndex = -1;
        var ledItems = {};

        for (var i = 0; i < orderData.items.length; ++i)
        {
          var item = orderData.items[i];

          if (item.kind === 'led')
          {
            ledItems[item.nc12] = {
              item: item,
              index: i
            };
          }
          else if (item.kind === 'program' && item.nc12 === data.nc12)
          {
            programItem = item;
            programItemIndex = i;
          }
          else if (item.kind === 'test' && data.programId !== null && item.nc12 === data.programId)
          {
            testItem = item;
            testItemIndex = i;
          }
          else if (item.kind === 'ft' && data.programId === FT_PROGRAM_ID)
          {
            ftItem = item;
            ftItemIndex = i;
          }
        }

        var $addToSet = {};
        var $set = {
          serviceTagCounter: orderData.serviceTagCounter + (data.serviceTag === null ? 1 : 0)
        };
        var changes = [
          function(orderData) { orderData.serviceTagCounter = $set.serviceTagCounter; }
        ];
        var anyLeds = false;

        if (programItemIndex !== -1)
        {
          var quantityPerResult = data.multi ? (programItem.quantityTodo / orderData.quantityTodo) : 1;
          var newProgramItemQuantityDone = programItem.quantityDone + quantityPerResult;

          $set['items.' + programItemIndex + '.quantityDone'] = newProgramItemQuantityDone;

          changes.push(applyItemQuantityDoneChange.bind(null, programItem, newProgramItemQuantityDone));
        }

        if (ftItemIndex === -1 && data.programId === FT_PROGRAM_ID)
        {
          ftItem = {
            kind: 'ft',
            nc12: data.programId,
            name: data.programName,
            quantityTodo: orderData.quantityTodo,
            quantityDone: 1,
            extraQuantityDone: 0,
            serialNumbers: []
          };

          $set['items.' + orderData.items.length] = ftItem;

          changes.push(function() { orderData.items.push(ftItem); });
        }
        else if (ftItemIndex !== -1)
        {
          var ftItemQuantityDone = ftItem.quantityDone + 1;

          $set['items.' + ftItemIndex + '.quantityDone'] = ftItemQuantityDone;

          changes.push(applyItemQuantityDoneChange.bind(null, ftItem, ftItemQuantityDone));
        }
        else if (testItemIndex === -1 && data.programId !== null)
        {
          testItem = {
            kind: 'test',
            nc12: data.programId,
            name: data.programName,
            quantityTodo: orderData.quantityTodo,
            quantityDone: 1,
            extraQuantityDone: 0,
            serialNumbers: []
          };

          $set['items.' + orderData.items.length] = testItem;

          changes.push(function() { orderData.items.push(testItem); });
        }
        else if (testItemIndex !== -1)
        {
          var testItemQuantityDone = testItem.quantityDone + 1;

          $set['items.' + testItemIndex + '.quantityDone'] = testItemQuantityDone;

          changes.push(applyItemQuantityDoneChange.bind(null, testItem, testItemQuantityDone));
        }

        _.forEach(data.leds, function(led)
        {
          var ledItem = ledItems[led.nc12];

          if (!ledItem)
          {
            return;
          }

          delete ledItems[led.nc12];

          var index = ledItem.index;
          var item = ledItem.item;

          var newLedItemQuantityDone = item.quantityDone + led.serialNumbers.length;

          $set['items.' + index + '.quantityDone'] = newLedItemQuantityDone;
          $addToSet['items.' + index + '.serialNumbers'] = {$each: led.serialNumbers};

          changes.push(applyItemQuantityDoneChange.bind(null, item, newLedItemQuantityDone));

          anyLeds = true;
        });

        if (changes.length === 0)
        {
          return setImmediate(this.skip(), new Error("No changes."));
        }

        var condition = {_id: data.orderNo};
        var updates = {$set: $set};

        if (anyLeds)
        {
          updates.$addToSet = $addToSet;
        }

        XiconfOrder.collection.update(condition, updates, this.next());

        this.orderData = orderData;
        this.changes = changes;
      },
      function applyChangesStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        applyOrderDataChanges(this.orderData, this.changes);

        var serviceTag = data.serviceTag === null
          ? buildServiceTag(this.orderData._id, this.orderData.serviceTagCounter)
          : data.serviceTag;

        return this.skip(null, serviceTag);
      },
      function replyStep(err, serviceTag)
      {
        if (err)
        {
          xiconfModule.error("Failed to acquire a new Service Tag for order [%s]: %s", data.orderNo, err.message);

          setImmediate(execNextOrderOperation, data.orderNo);
        }
        else
        {
          app.broker.publish('xiconf.orders.' + data.orderNo + '.serviceTagAcquired', {
            orderNo: data.orderNo,
            serviceTag: serviceTag
          });

          debug('[acquireNextServiceTag] orderNo=%s recount=%s serviceTag=%s', data.orderNo, data.recount, serviceTag);

          if (data.recount)
          {
            setImmediate(recountOrder, data);
          }
          else
          {
            setImmediate(execNextOrderOperation, data.orderNo);
          }
        }

        this.orderData = null;
        this.changes = null;

        done(err, _.isString(serviceTag) ? serviceTag : null);
      }
    );
  }

  function releaseNextServiceTag(data, done)
  {
    step(
      function getOrderDataStep()
      {
        getOrderData(data.orderNo, this.next());
      },
      function updateXiconfOrderStep(err, orderData)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderData)
        {
          return this.skip(new Error('ORDER_NOT_FOUND'));
        }

        var serviceTagCounter = +data.serviceTag.substr(-4);

        if (orderData.serviceTagCounter < serviceTagCounter)
        {
          return this.skip(new Error('SERVICE_TAG_NOT_ACQUIRED'));
        }

        var programItem;
        var programItemIndex = -1;
        var testItem;
        var testItemIndex = -1;
        var ledItems = {};
        var ftItem;
        var ftItemIndex = -1;

        for (var i = 0; i < orderData.items.length; ++i)
        {
          var item = orderData.items[i];

          if (item.kind === 'led')
          {
            ledItems[item.nc12] = {
              item: item,
              index: i
            };
          }
          else if (item.kind === 'program' && item.nc12 === data.nc12)
          {
            programItem = item;
            programItemIndex = i;
          }
          else if (item.kind === 'test' && data.programId !== null && item.nc12 === data.programId)
          {
            testItem = item;
            testItemIndex = i;
          }
          else if (item.kind === 'ft' && data.programId === FT_PROGRAM_ID)
          {
            ftItem = item;
            ftItemIndex = i;
          }
        }

        var $pull = {};
        var $set = {};
        var changes = [];
        var anyLeds = false;

        if (programItemIndex !== -1)
        {
          var quantityPerResult = data.multi ? (programItem.quantityTodo / orderData.quantityTodo) : 1;
          var newProgramItemQuantityDone = programItem.quantityDone - quantityPerResult;

          $set['items.' + programItemIndex + '.quantityDone'] = newProgramItemQuantityDone;

          changes.push(applyItemQuantityDoneChange.bind(null, programItem, newProgramItemQuantityDone));
        }

        if (testItemIndex !== -1)
        {
          var newTestItemQuantityDone = testItem.quantityDone - 1;

          $set['items.' + testItemIndex + '.quantityDone'] = newTestItemQuantityDone;

          changes.push(applyItemQuantityDoneChange.bind(null, testItem, newTestItemQuantityDone));
        }

        if (ftItemIndex !== -1)
        {
          var newFtItemQuantityDone = ftItem.quantityDone - 1;

          $set['items.' + ftItemIndex + '.quantityDone'] = newFtItemQuantityDone;

          changes.push(applyItemQuantityDoneChange.bind(null, ftItem, newFtItemQuantityDone));
        }

        _.forEach(data.leds, function(led)
        {
          var ledItem = ledItems[led.nc12];

          if (!ledItem)
          {
            return;
          }

          delete ledItems[led.nc12];

          var index = ledItem.index;
          var item = ledItem.item;

          var newLedItemQuantityDone = item.quantityDone - led.serialNumbers.length;

          $set['items.' + index + '.quantityDone'] = newLedItemQuantityDone;
          $pull['items.' + index + '.serialNumbers'] = led.serialNumbers;

          changes.push(applyItemQuantityDoneChange.bind(null, item, newLedItemQuantityDone));

          anyLeds = true;
        });

        var condition = {_id: data.orderNo};
        var updates = {$set: $set};

        if (anyLeds)
        {
          updates.$pullAll = $pull;
        }

        XiconfOrder.collection.update(condition, updates, this.next());

        this.orderData = orderData;
        this.changes = changes;
      },
      function applyChangesStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        applyOrderDataChanges(this.orderData, this.changes);
      },
      function replyStep(err)
      {
        if (err)
        {
          xiconfModule.error(
            "Failed to release Service Tag [%s] for order [%s]: %s", data.serviceTag, data.orderNo, err.message
          );

          setImmediate(execNextOrderOperation, data.orderNo);
        }
        else
        {
          app.broker.publish('xiconf.orders.' + data.orderNo + '.serviceTagReleased', {
            orderNo: data.orderNo,
            serviceTag: data.serviceTag
          });

          setImmediate(recountOrder, data);
        }

        this.orderData = null;
        this.changes = null;

        done(err);
      }
    );
  }

  function applyOrderDataChanges(orderData, changes)
  {
    for (var i = 0; i < changes.length; ++i)
    {
      changes[i](orderData);
    }
  }

  function applyItemQuantityDoneChange(item, newQuantityDone)
  {
    item.quantityDone = newQuantityDone;
  }

  function getProdLineData(prodLineId)
  {
    if (!prodLinesToDataMap[prodLineId])
    {
      prodLinesToDataMap[prodLineId] = {
        prodLineId: prodLineId,
        leader: null,
        orders: [],
        sockets: {}
      };
    }

    return prodLinesToDataMap[prodLineId];
  }

  function getOrderData(orderNo, done)
  {
    if (!orderNo)
    {
      return done(null, null);
    }

    if (ordersToDataMap[orderNo])
    {
      return done(null, ordersToDataMap[orderNo]);
    }

    if (ordersToGetOrderDataQueueMap[orderNo])
    {
      return ordersToGetOrderDataQueueMap[orderNo].push(done);
    }

    ordersToGetOrderDataQueueMap[orderNo] = [done];

    step(
      function findXiconfOrderStep()
      {
        XiconfOrder.findById(orderNo, {'items.serialNumbers': 0}).lean().exec(this.next());
      },
      function sendResultsStep(err, xiconfOrder)
      {
        if (err || xiconfOrder)
        {
          return this.skip(err, xiconfOrder);
        }

        var fields = {
          nc12: 1,
          name: 1,
          startDate: 1,
          finishDate: 1,
          qty: 1
        };

        Order.findById(orderNo, fields).lean().exec(this.next());
      },
      function createXiconfOrder(err, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          debug('[getOrderData] Order not found: %s', orderNo);

          return this.skip(null, null);
        }

        debug('[getOrderData] Creating XiconfOrder from Order: %s', orderNo);

        var xiconfOrder = new XiconfOrder({
          _id: orderNo,
          startDate: order.startDate,
          finishDate: order.finishDate,
          reqDate: order.startDate,
          name: order.name,
          nc12: [order.nc12],
          quantityTodo: order.qty,
          quantityDone: 0,
          status: -1,
          serviceTagCounter: 0,
          items: [],
          startedAt: null,
          finishedAt: null,
          importedAt: new Date()
        });

        xiconfOrder.save(this.next());
      },
      function sendResultsStep(err, xiconfOrder)
      {
        if (err)
        {
          xiconfModule.error("Failed to get data for order [%s]: %s", orderNo, err.message);

          return sendGetOrderDataResults(orderNo, err, null);
        }

        if (xiconfOrder !== null)
        {
          ordersToDataMap[orderNo] = _.isFunction(xiconfOrder.toObject) ? xiconfOrder.toObject() : xiconfOrder;
        }

        return sendGetOrderDataResults(orderNo, null, xiconfOrder);
      }
    );
  }

  function sendGetOrderDataResults(orderNo, err, orderData)
  {
    var queue = ordersToGetOrderDataQueueMap[orderNo];

    if (!queue)
    {
      return;
    }

    delete ordersToGetOrderDataQueueMap[orderNo];

    for (var i = 0; i < queue.length; ++i)
    {
      queue[i](err, orderData);
    }
  }

  function updateProdLinesLeader(prodLineId, optSocket)
  {
    var prodLineData = prodLinesToDataMap[prodLineId];

    if (!prodLineData)
    {
      return;
    }

    var prodLineState = productionModule.getProdLineState(prodLineId);
    var newLeader = prodLineState ? prodLineState.getCurrentLeader() : null;

    if (newLeader !== null)
    {
      newLeader = newLeader.label;
    }

    if (optSocket)
    {
      optSocket.emit('xiconf.leaderUpdated', newLeader);
    }

    if (newLeader === prodLineData.leader)
    {
      return;
    }

    prodLineData.leader = newLeader;

    if (optSocket)
    {
      return;
    }

    _.forEach(prodLineData.sockets, function(socket)
    {
      socket.emit('xiconf.leaderUpdated', newLeader);
    });
  }

  function updateProdLinesRemoteData(prodLineId, optSocket)
  {
    debug('[updateProdLinesRemoteData] prodLine=%s socket=%s', prodLineId, optSocket ? optSocket.id : null);

    if (!prodLinesToDataMap[prodLineId])
    {
      return;
    }

    var prodLineState = productionModule.getProdLineState(prodLineId);

    if (prodLineState === null)
    {
      return emitEmptyRemoteDataForProdLineUpdate(prodLineId, optSocket);
    }

    var prodShiftOrders = prodLineState.getOrders();
    var prodShiftOrdersCount = prodShiftOrders.length;

    if (!prodShiftOrdersCount)
    {
      return emitEmptyRemoteDataForProdLineUpdate(prodLineId, optSocket);
    }

    var currentOrder = prodShiftOrders[prodShiftOrdersCount - 1];

    if (currentOrder.finishedAt !== null || !_.isString(currentOrder.orderData.no))
    {
      return emitEmptyRemoteDataForProdLineUpdate(prodLineId, optSocket);
    }

    var currentOrderNo = currentOrder.orderData.no;
    var newOrdersNos = [currentOrderNo];
    var now = Date.now();

    for (var i = prodShiftOrdersCount - 2; i >= 0; --i)
    {
      var previousOrder = prodShiftOrders[i];

      if ((now - previousOrder.finishedAt) > 3600000)
      {
        break;
      }

      if (previousOrder.orderData.no !== currentOrderNo)
      {
        newOrdersNos.push(previousOrder.orderData.no);
      }
    }

    newOrdersNos = _.unique(newOrdersNos);

    step(
      function getOrderDataStep()
      {
        for (var i = 0; i < newOrdersNos.length; ++i)
        {
          getOrderData(newOrdersNos[i], this.group());
        }
      },
      function emitRemoteDataStep(err, newOrdersData)
      {
        if (err)
        {
          return emitEmptyRemoteDataForProdLineUpdate(prodLineId, optSocket);
        }

        newOrdersData = newOrdersData.filter(function(orderData) { return orderData !== null; });
        newOrdersNos = newOrdersData.map(function(orderData) { return orderData._id; });

        return emitRemoteDataForProdLineUpdate(prodLineId, optSocket, newOrdersNos, newOrdersData);
      }
    );
  }

  function emitEmptyRemoteDataForProdLineUpdate(prodLineId, socket)
  {
    emitRemoteDataForProdLineUpdate(prodLineId, socket, [], []);
  }

  function emitRemoteDataForProdLineUpdate(prodLineId, optSocket, newOrdersNos, remoteData)
  {
    var prodLineData = prodLinesToDataMap[prodLineId];

    if (!prodLineData)
    {
      return;
    }

    manageProdLinesOrders(prodLineData, newOrdersNos);

    if (optSocket)
    {
      debug('[emitRemoteDataForProdLineUpdate] prodLine=%s socket=%s', prodLineId, optSocket.id, newOrdersNos);

      return optSocket.emit('xiconf.remoteDataUpdated', remoteData);
    }

    debug('[emitRemoteDataForProdLineUpdate] prodLine=%s', prodLineId, newOrdersNos, Object.keys(prodLineData.sockets));

    _.forEach(prodLineData.sockets, function(socket)
    {
      socket.emit('xiconf.remoteDataUpdated', remoteData);
    });
  }

  function manageProdLinesOrders(prodLineData, newOrdersNos)
  {
    var oldOrdersNos = prodLineData.orders;
    var oldCurrentOrderNo = oldOrdersNos.length ? oldOrdersNos[0] : null;
    var newCurrentOrderNo = newOrdersNos.length ? newOrdersNos[0] : null;

    debug('[manageProdLinesOrders]', oldOrdersNos, newOrdersNos);

    prodLineData.orders = newOrdersNos;

    manageProdLinesCurrentOrder(prodLineData, oldCurrentOrderNo, newCurrentOrderNo);

    for (var i = 1; i < newOrdersNos.length; ++i)
    {
      var oldPreviousOrderNo = oldOrdersNos[i];
      var newPreviousOrderNo = newOrdersNos[i];

      if (oldPreviousOrderNo !== newPreviousOrderNo)
      {
        manageProdLinesPreviousOrder(prodLineData, oldPreviousOrderNo, newPreviousOrderNo);
      }
    }
  }

  function manageProdLinesCurrentOrder(prodLineData, oldCurrentOrderNo, newCurrentOrderNo)
  {
    debug('[manageProdLinesCurrentOrder] old=%s new=%s', oldCurrentOrderNo, newCurrentOrderNo);

    if (oldCurrentOrderNo !== null)
    {
      var orderToProdLinesMap = ordersToProdLinesMap[oldCurrentOrderNo];

      if (orderToProdLinesMap)
      {
        delete orderToProdLinesMap[prodLineData.prodLineId];
      }

      if (oldCurrentOrderNo !== newCurrentOrderNo)
      {
        scheduleWorkingOrderChangeCheck(oldCurrentOrderNo);
      }
    }

    if (newCurrentOrderNo === null)
    {
      return;
    }

    if (!ordersToProdLinesMap[newCurrentOrderNo])
    {
      ordersToProdLinesMap[newCurrentOrderNo] = {};
    }

    ordersToProdLinesMap[newCurrentOrderNo][prodLineData.prodLineId] = 1;
  }

  function manageProdLinesPreviousOrder(prodLineData, oldPreviousOrderNo, newPreviousOrderNo)
  {
    debug('[manageProdLinesPreviousOrder] old=%s new=%s', oldPreviousOrderNo, newPreviousOrderNo);

    if (ordersToProdLinesMap[oldPreviousOrderNo])
    {
      delete ordersToProdLinesMap[oldPreviousOrderNo][prodLineData.prodLineId];
    }

    if (newPreviousOrderNo === null)
    {
      return;
    }

    if (!ordersToProdLinesMap[newPreviousOrderNo])
    {
      ordersToProdLinesMap[newPreviousOrderNo] = {};
    }

    ordersToProdLinesMap[newPreviousOrderNo][prodLineData.prodLineId] = -1;
  }

  function emitRemoteDataToOrderWorkers(orderNo)
  {
    getOrderData(orderNo, function(err, orderData)
    {
      if (err)
      {
        return xiconfModule.error("Failed to emit remote data to [%s] order workers: %s", orderNo, err.message);
      }

      var orderToProdLinesMap = ordersToProdLinesMap[orderNo];

      if (!orderToProdLinesMap)
      {
        return debug('[emitRemoteDataToOrderWorkers] NO_PROD_LINES_FOR_ORDER orderNo=%s', orderNo);
      }

      var prodLineIds = Object.keys(orderToProdLinesMap);

      if (!prodLineIds.length)
      {
        return debug('[emitRemoteDataToOrderWorkers] NO_PROD_LINES_IN_ORDER orderNo=%s', orderNo);
      }

      _.forEach(prodLineIds, function(prodLineId)
      {
        var prodLineData = prodLinesToDataMap[prodLineId];

        if (!prodLineData)
        {
          return debug('[emitRemoteDataToOrderWorkers] NO_PROD_LINE orderNo=%s prodLine=%s', orderNo, prodLineId);
        }

        debug(
          '[emitRemoteDataToOrderWorkers] orderNo=%s prodLine=%s',
          orderNo,
          prodLineId,
          Object.keys(prodLineData.sockets)
        );

        _.forEach(prodLineData.sockets, function(socket)
        {
          socket.emit('xiconf.remoteDataUpdated', orderData);
        });
      });
    });
  }

  function scheduleWorkingOrderChangeCheck(orderNo)
  {
    if (workingOrderChangeCheckTimers[orderNo])
    {
      clearTimeout(workingOrderChangeCheckTimers[orderNo]);
    }

    var now = moment();
    var delay = moment();
    var hours = now.hours();
    var minutes = now.minutes();

    if ([5, 13, 21].indexOf(hours) !== -1 && minutes > 45)
    {
      delay.add(1, 'hours').startOf('hour').add(WORKING_ORDER_CHANGE_CHECK_NEAR_SHIFT_CHANGE_MINUTES, 'minutes');
    }
    else if ([6, 14, 22].indexOf(hours) !== -1 && minutes < 15)
    {
      delay.startOf('hour').add(WORKING_ORDER_CHANGE_CHECK_NEAR_SHIFT_CHANGE_MINUTES, 'minutes');
    }

    delay = Math.max(WORKING_ORDER_CHANGE_CHECK_DELAY, delay.diff(now));

    debug('[scheduleWorkingOrderChangeCheck] orderNo=%s delay=%d', orderNo, delay);

    workingOrderChangeCheckTimers[orderNo] = setTimeout(checkWorkingOrderChange, delay, orderNo);
  }

  function checkWorkingOrderChange(orderNo)
  {
    delete workingOrderChangeCheckTimers[orderNo];

    var orderToProdLines = ordersToProdLinesMap[orderNo];

    if (!orderToProdLines)
    {
      return debug('[checkWorkingOrderChange] EMPTY orderNo=%s', orderNo);
    }

    var prodLineIds = Object.keys(orderToProdLines);
    var anyCurrent = false;

    for (var i = 0; i < prodLineIds.length; ++i)
    {
      if (orderToProdLines[prodLineIds[i]] === 1)
      {
        anyCurrent = true;

        break;
      }
    }

    if (prodLineIds.length === 0)
    {
      debug('[checkWorkingOrderChange] NO_PROD_LINES orderNo=%s', orderNo);

      delete ordersToProdLinesMap[orderNo];
      delete ordersToDataMap[orderNo];
    }

    if (!anyCurrent)
    {
      app.broker.publish('xiconf.orders.' + orderNo + '.changed', {
        orderNo: orderNo
      });
    }

    debug('[checkWorkingOrderChange] orderNo=%s changed=%s', orderNo, !anyCurrent);
  }

  function isMultiDeviceResult(xiconfResult)
  {
    return _.isString(xiconfResult.workflow) && /multidevice\s*=\s*true/i.test(xiconfResult.workflow);
  }

  function createLedsFromXiconfResult(xiconfResultLeds)
  {
    var ledList = [];

    if (!Array.isArray(xiconfResultLeds) || !xiconfResultLeds.length)
    {
      return ledList;
    }

    var ledMap = {};

    for (var i = 0; i < xiconfResultLeds.length; ++i)
    {
      var xiconfResultLed = xiconfResultLeds[i];

      if (!ledMap[xiconfResultLed.nc12])
      {
        ledMap[xiconfResultLed.nc12] = {
          nc12: xiconfResultLed.nc12,
          serialNumbers: []
        };

        ledList.push(ledMap[xiconfResultLed.nc12]);
      }

      if (typeof xiconfResultLed.serialNumber === 'string')
      {
        ledMap[xiconfResultLed.nc12].serialNumbers.push(xiconfResultLed.serialNumber);
      }
    }

    return ledList;
  }

  function cleanUpOrders()
  {
    var orderIds = Object.keys(ordersToProdLinesMap);

    for (var i = 0; i < orderIds.length; ++i)
    {
      var orderNo = orderIds[i];
      var ordersProdLineCount = Object.keys(ordersToProdLinesMap[orderNo]).length;

      if (ordersProdLineCount === 0)
      {
        delete ordersToDataMap[orderNo];
        delete ordersToProdLinesMap[orderNo];
      }
    }

    debug('[cleanUpOrders]');
  }

  function checkClientsLicenseKey(socket, licenseId, clientsLicenseKey)
  {
    if (!_.isString(licenseId) || !_.isString(clientsLicenseKey))
    {
      return;
    }

    License.findById(licenseId, function(err, license)
    {
      if (err)
      {
        return xiconfModule.error("Failed to find license [%s]: %s", licenseId, err.message);
      }

      if (!license || clientsLicenseKey === license.key)
      {
        return;
      }

      handleConfigureRequest({socket: socket, settings: {licenseKey: license.key}}, function(err)
      {
        if (err)
        {
          xiconfModule.warn("Failed to update the client's license key on client connect: %s", err.message);
        }
      });
    });
  }

  function buildServiceTag(orderNo, counter)
  {
    var serviceTag = _.padLeft(counter.toString(), 4, '0');
    serviceTag = _.padLeft(orderNo.toString() + serviceTag, 17, '0');
    serviceTag = 'P' + serviceTag;

    return serviceTag;
  }

  function debug()
  {
    if (debugMode)
    {
      xiconfModule.debug.apply(xiconfModule, arguments);
    }
  }
};
