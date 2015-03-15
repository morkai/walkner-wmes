// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');

module.exports = function setUpXiconfCommands(app, xiconfModule)
{
  var EMPTY_REMOTE_DATA = {
    orderNo: null,
    nc12: [],
    quantityTodo: null,
    quantityDone: null,
    startedAt: null,
    finishedAt: null,
    ledOrder: null
  };

  var sio = app[xiconfModule.config.sioId];
  var productionModule = app[xiconfModule.config.productionId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var XiconfProgramOrder = mongoose.model('XiconfProgramOrder');
  var XiconfLedOrder = mongoose.model('XiconfLedOrder');

  var prodLineDataMap = {};
  var orderDataMap = {};
  var ordersToProdLinesMap = {};
  var getOrderDataQueue = {};
  var updateOrderQueues = {};
  var workingOrderChangeCheckTimers = {};

  app.broker.subscribe('production.stateChanged.**', function(changes)
  {
    if (changes.prodShiftOrders !== undefined)
    {
      updateProdLinesRemoteData(changes._id, null);
    }
  });

  sio.sockets.on('connection', function(socket)
  {
    var socketSrcId = null;
    var socketProdLineId = null;

    socket.on('disconnect', function()
    {
      var prodLineInfo = prodLineDataMap[socketProdLineId];

      if (!prodLineInfo)
      {
        return;
      }

      if (!prodLineInfo.sockets[socket.id])
      {
        return;
      }

      delete prodLineInfo.sockets[socket.id];

      xiconfModule.debug("[%s] disconnected from [%s] (socket=[%s])", socketSrcId, socketProdLineId, socket.id);
    });

    socket.on('xiconf.connect', function(srcId, prodLineId)
    {
      if (!_.isString(srcId) || _.isEmpty(srcId) || !_.isString(prodLineId) || _.isEmpty(prodLineId))
      {
        return;
      }

      socketSrcId = srcId;
      socketProdLineId = prodLineId;

      getProdLineData(prodLineId).sockets[socket.id] = socket;

      xiconfModule.info("[%s] connected to [%s] (socket=[%s])", srcId, prodLineId, socket.id);

      updateProdLinesRemoteData(prodLineId, socket);
    });

    socket.on('xiconf.acquireServiceTag', function(input, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (socketProdLineId === null)
      {
        return reply(new Error('NOT_CONNECTED'));
      }

      if (!_.isObject(input)
        || !_.isString(input.resultId)
        || !_.isString(input.orderNo)
        || !_.isString(input.nc12))
      {
        return reply(new Error('INPUT'));
      }

      acquireServiceTag(input.resultId, input.orderNo, input.nc12, reply);
    });

    socket.on('xiconf.releaseServiceTag', function(input, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (socketProdLineId === null)
      {
        return reply(new Error('NOT_CONNECTED'));
      }

      if (!_.isObject(input)
        || !_.isString(input.resultId)
        || !_.isString(input.orderNo)
        || !_.isString(input.nc12))
      {
        return reply(new Error('INPUT'));
      }

      releaseServiceTag(input.resultId, input.orderNo, input.nc12, reply);
    });
  });

  function acquireServiceTag(resultId, orderNo, nc12, replyWithServiceTag)
  {
    var updateOrderQueue = updateOrderQueues[orderNo];
    var queueItem = {
      operation: acquireNextServiceTag,
      reply: replyWithServiceTag,
      resultId: resultId,
      orderNo: orderNo,
      nc12: nc12
    };

    if (Array.isArray(updateOrderQueue))
    {
      return updateOrderQueue.push(queueItem);
    }

    updateOrderQueues[orderNo] = [queueItem];

    execNextOrderUpdate(orderNo);
  }

  function releaseServiceTag(resultId, orderNo, nc12, reply)
  {
    var updateOrderQueue = updateOrderQueues[orderNo];
    var queueItem = {
      operation: releaseNextServiceTag,
      reply: reply,
      resultId: resultId,
      orderNo: orderNo,
      nc12: nc12
    };

    if (Array.isArray(updateOrderQueue))
    {
      return updateOrderQueue.push(queueItem);
    }

    updateOrderQueue[orderNo] = [queueItem];

    execNextOrderUpdate(orderNo);
  }

  function execNextOrderUpdate(orderNo)
  {
    var updateOrderQueue = updateOrderQueues[orderNo];

    if (!Array.isArray(updateOrderQueue))
    {
      return;
    }

    if (updateOrderQueue.length === 0)
    {
      delete updateOrderQueues[orderNo];

      return;
    }

    var queueItem = updateOrderQueue.shift();

    queueItem.operation(queueItem);
  }

  function acquireNextServiceTag(data)
  {
    var orderNo = data.orderNo;
    var nc12 = data.nc12;
    var replyWithServiceTag = data.reply;

    step(
      function getOrderDataStep()
      {
        getOrderData(orderNo, this.next());
      },
      function updateProgramOrderStep(err, orderData)
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

        var nc12Copy = _.cloneDeep(orderData.nc12);
        var changedNc12 = _.find(nc12Copy, {_id: nc12});

        if (!changedNc12)
        {
          return this.skip(new Error('INVALID_NC12'));
        }

        changedNc12.quantityDone += 1;

        this.orderData = orderData;
        this.changes = {
          nc12: nc12Copy,
          quantityDone: orderData.quantityDone + 1,
          serviceTagCounter: orderData.serviceTagCounter + 1,
          status: getOrderStatus(nc12Copy)
        };

        if (this.orderData.createdAt === null)
        {
          this.changes.createdAt = new Date();
        }

        if (this.orderData.finishedAt === null && this.changes.status !== -1)
        {
          this.changes.finishedAt = new Date();
        }

        XiconfProgramOrder.collection.update({_id: orderNo}, {$set: this.changes}, this.next());
      },
      function updateOrderDataStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        _.merge(this.orderData, this.changes, {
          lastActionAt: new Date()
        });

        var serviceTag = pad0(this.orderData._id.toString() + pad0(this.orderData.serviceTagCounter.toString(), 4), 17);

        return this.skip(null, 'P' + serviceTag);
      },
      function replyWithServiceTagStep(err, serviceTag)
      {
        replyWithServiceTag(err, _.isString(serviceTag) ? serviceTag : null);

        if (!err)
        {
          this.changes._id = orderNo;

          app.broker.publish('xiconf.orders.' + orderNo + '.serviceTagAcquired', this.changes);
        }

        this.orderData = null;
        this.changes = null;

        setImmediate(emitRemoteDataToOrderWorkers.bind(null, orderNo));
        setImmediate(execNextOrderUpdate.bind(null, orderNo));
      }
    );
  }

  function releaseNextServiceTag(data)
  {
    var orderNo = data.orderNo;
    var nc12 = data.nc12;
    var reply = data.reply;

    step(
      function getOrderDataStep()
      {
        getOrderData(orderNo, this.next());
      },
      function updateProgramOrderStep(err, orderData)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderData)
        {
          return this.skip(new Error('ORDER_NOT_FOUND'));
        }

        var nc12Copy = _.cloneDeep(orderData.nc12);
        var changedNc12 = _.find(nc12Copy, {_id: nc12});

        if (!changedNc12)
        {
          return this.skip(new Error('INVALID_NC12'));
        }

        changedNc12.quantityDone -= 1;

        this.orderData = orderData;
        this.changes = {
          nc12: nc12Copy,
          quantityDone: orderData.quantityDone - 1,
          status: getOrderStatus(nc12Copy)
        };

        if (this.changes.status === -1)
        {
          this.changes.finishedAt = null;
        }

        XiconfProgramOrder.collection.update({_id: orderNo}, {$set: this.changes}, this.next());
      },
      function updateOrderDataStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        _.merge(this.orderData, this.changes, {
          lastActionAt: new Date()
        });

        return this.skip(null);
      },
      function replyStep(err)
      {
        reply(err);

        if (!err)
        {
          this.changes._id = orderNo;

          app.broker.publish('xiconf.orders.' + orderNo + '.serviceTagReleased', this.changes);
        }

        this.orderData = null;
        this.changes = null;

        setImmediate(emitRemoteDataToOrderWorkers.bind(null, orderNo));
        setImmediate(execNextOrderUpdate.bind(null, orderNo));
      }
    );
  }

  function getProdLineData(prodLineId)
  {
    if (!prodLineDataMap[prodLineId])
    {
      prodLineDataMap[prodLineId] = {
        orderNo: null,
        sockets: {}
      };
    }

    return prodLineDataMap[prodLineId];
  }

  function getOrderData(orderNo, done)
  {
    if (!orderNo)
    {
      return done(null, null);
    }

    if (orderDataMap[orderNo])
    {
      return done(null, orderDataMap[orderNo]);
    }

    if (getOrderDataQueue[orderNo])
    {
      return getOrderDataQueue[orderNo].push(done);
    }

    getOrderDataQueue[orderNo] = [done];

    step(
      function findOrderDataStep()
      {
        Order.findById(orderNo, {_id: 0, qty: 1}).lean().exec(this.parallel());
        XiconfProgramOrder.findById(orderNo).lean().exec(this.parallel());
        XiconfLedOrder.findById(orderNo).lean().exec(this.parallel());
      },
      function sendResultsStep(err, parentOrder, programOrder, ledOrder)
      {
        if (err)
        {
          xiconfModule.error("Failed to get data for order [%s]: %s", orderNo, err.message);

          return sendGetOrderDataResults(orderNo, err, null);
        }

        if (!programOrder)
        {
          if (!ledOrder)
          {
            xiconfModule.warn("No data for order [%s]...", orderNo);

            return sendGetOrderDataResults(orderNo, null, null);
          }

          var quantityParent = parentOrder ? parentOrder.qty : 0;

          programOrder = {
            _id: orderNo,
            reqDate: ledOrder.reqDate,
            nc12: [],
            quantityParent: quantityParent,
            quantityTodo: quantityParent,
            quantityDone: 0,
            serviceTagCounter: 0,
            status: -1,
            importedAt: ledOrder.importedAt,
            createdAt: null,
            finishedAt: null
          };

          XiconfProgramOrder.collection.insert(_.cloneDeep(programOrder), function(err)
          {
            if (err)
            {
              xiconfModule.error("Failed to create program order from LED order [%s]: %s", orderNo, err.message);
            }
          });
        }

        programOrder.lastActionAt = new Date();
        programOrder.ledOrder = ledOrder;

        orderDataMap[orderNo] = programOrder;

        return sendGetOrderDataResults(orderNo, null, programOrder);
      }
    );
  }

  function sendGetOrderDataResults(orderNo, err, orderData)
  {
    var queue = getOrderDataQueue[orderNo];

    if (!queue)
    {
      return;
    }

    delete getOrderDataQueue[orderNo];

    _.forEach(queue, function(done) { done(err, orderData); });
  }

  function updateProdLinesRemoteData(prodLineId, socket)
  {
    var prodLineState = productionModule.getProdLineState(prodLineId);
    var prodShiftOrder = null;

    if (prodLineState !== null)
    {
      prodShiftOrder = prodLineState.getCurrentOrder();
    }

    if (prodShiftOrder === null)
    {
      return emitRemoteDataForProdLineUpdate(prodLineId, socket, EMPTY_REMOTE_DATA);
    }

    getOrderData(prodShiftOrder.orderData.no, function(err, orderData)
    {
      emitRemoteDataForProdLineUpdate(prodLineId, socket, orderToRemoteData(orderData));
    });
  }

  function orderToRemoteData(orderData)
  {
    return !orderData ? EMPTY_REMOTE_DATA : {
      orderNo: orderData._id,
      nc12: orderData.nc12,
      quantityTodo: orderData.quantityTodo,
      quantityDone: orderData.quantityDone,
      startedAt: orderData.createdAt ? orderData.createdAt.getTime() : null,
      finishedAt: orderData.finishedAt ? orderData.finishedAt.getTime() : null,
      ledOrder: !orderData.ledOrder ? null : {
        nc12: orderData.ledOrder.nc12,
        name: orderData.ledOrder.name,
        quantityParent: orderData.ledOrder.quantityParent,
        quantityTodo: orderData.ledOrder.quantityTodo,
        quantityDone: orderData.ledOrder.quantityDone,
        startedAt: orderData.ledOrder.createdAt ? orderData.ledOrder.createdAt.getTime() : null,
        finishedAt: orderData.ledOrder.finishedAt ? orderData.ledOrder.finishedAt.getTime() : null
      }
    };
  }

  function emitRemoteDataForProdLineUpdate(prodLineId, socket, remoteData)
  {
    var prodLineData = prodLineDataMap[prodLineId];

    if (!prodLineData)
    {
      return;
    }

    var oldOrderNo = prodLineData.orderNo;
    var newOrderNo = remoteData.orderNo;

    if (oldOrderNo !== newOrderNo)
    {
      if (oldOrderNo !== null)
      {
        var orderToProdLinesMap = ordersToProdLinesMap[oldOrderNo];

        if (orderToProdLinesMap)
        {
          delete orderToProdLinesMap[prodLineId];
        }

        scheduleWorkingOrderChangeCheck(oldOrderNo);
      }

      prodLineData.orderNo = newOrderNo;

      if (newOrderNo !== null)
      {
        if (!ordersToProdLinesMap[newOrderNo])
        {
          ordersToProdLinesMap[newOrderNo] = {};
        }

        ordersToProdLinesMap[newOrderNo][prodLineId] = true;
      }

    }

    if (socket)
    {
      return socket.emit('xiconf.remoteDataUpdated', remoteData);
    }

    _.forEach(prodLineData.sockets, function(socket)
    {
      socket.emit('xiconf.remoteDataUpdated', remoteData);
    });
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
        return;
      }

      var prodLineIds = Object.keys(orderToProdLinesMap);

      if (!prodLineIds.length)
      {
        return;
      }

      var remoteData = orderToRemoteData(orderData);

      _.forEach(prodLineIds, function(prodLineId)
      {
        var prodLineData = prodLineDataMap[prodLineId];

        if (!prodLineData)
        {
          return;
        }

        _.forEach(prodLineData.sockets, function(socket)
        {
          socket.emit('xiconf.remoteDataUpdated', remoteData);
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
      delay.add(1, 'hours').startOf('hour').add(15, 'minutes');
    }
    else if ([6, 14, 22].indexOf(hours) !== -1 && minutes < 15)
    {
      delay.startOf('hour').add(15, 'minutes');
    }

    workingOrderChangeCheckTimers[orderNo] = setTimeout(
      checkWorkingOrderChange,
      Math.max(1337, delay.diff(now)), orderNo
    );
  }

  function checkWorkingOrderChange(orderNo)
  {
    delete workingOrderChangeCheckTimers[orderNo];

    var orderToProdLines = ordersToProdLinesMap[orderNo];

    if (orderToProdLines === undefined || Object.keys(orderToProdLines).length)
    {
      return;
    }

    delete ordersToProdLinesMap[orderNo];
    delete orderDataMap[orderNo];

    app.broker.publish('xiconf.orders.' + orderNo + '.changed', {
      orderNo: orderNo
    });
  }

  function getOrderStatus(nc12)
  {
    var over = 0;
    var exact = 0;

    for (var i = 0; i < nc12.length; ++i)
    {
      var done = nc12[i].quantityDone;
      var todo = nc12[i].quantityTodo;

      if (done < todo)
      {
        return -1;
      }

      if (done > todo)
      {
        ++over;
      }
      else
      {
        ++exact;
      }
    }

    return exact === nc12.length ? 0 : 1;
  }

  function pad0(str, length)
  {
    while (str.length < length)
    {
      str = '0' + str;
    }

    return str;
  }
};
