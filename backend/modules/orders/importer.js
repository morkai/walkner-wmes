'use strict';

var lodash = require('lodash');
var cheerio = require('cheerio');
var deepEqual = require('deep-equal');
var step = require('h5.step');

module.exports = function setUpOrdersImporter(app, ordersModule)
{
  var ORDER_INFO_SUBJECT = 'Job PL02_ORDER_INFO, Step ';
  var OPER_INFO_SUBJECT = 'Job PL02_OPER_INFO, Step ';
  var LATE_DATA_PARSE_DELAY = 10 * 60;

  var Order = app[ordersModule.config.mongooseId].model('Order');

  var parseDataTimer = null;
  var parseDataLocked = false;
  var orderInfoQueue = [];
  var operInfoQueue = [];

  app.broker
    .subscribe('mail.received', handleMail)
    .setFilter(function(mail)
    {
      return mail.subject.indexOf(ORDER_INFO_SUBJECT) !== -1
        || mail.subject.indexOf(OPER_INFO_SUBJECT) !== -1;
    });

  function handleMail(mail)
  {
    var queue;
    var attachmentName;

    if (mail.subject === ORDER_INFO_SUBJECT)
    {
      queue = orderInfoQueue;
      attachmentName = ORDER_INFO_SUBJECT + '.htm';
    }
    else
    {
      queue = operInfoQueue;
      attachmentName = OPER_INFO_SUBJECT + '.htm';
    }

    var attachment = lodash.find(mail.attachments, function(attachment)
    {
      return attachment.contentType === 'text/html'
        && attachment.fileName === attachmentName;
    });

    if (!attachment)
    {
      return;
    }

    queue.push(attachment.content.toString());

    if (orderInfoQueue.length > 0 && operInfoQueue.length > 0)
    {
      setImmediate(parseData);
    }
    else if (parseDataTimer === null)
    {
      parseDataTimer = setTimeout(parseData, LATE_DATA_PARSE_DELAY * 1000);
    }
  }

  function parseData()
  {
    if (parseDataLocked)
    {
      return;
    }

    parseDataLocked = true;

    if (parseDataTimer !== null)
    {
      clearTimeout(parseDataTimer);
      parseDataTimer = null;
    }

    if (orderInfoQueue.length > 0)
    {
      parseOrderInfo(orderInfoQueue.shift(), operInfoQueue.shift());
    }
    else if (operInfoQueue.length > 0)
    {
      parseOperInfo({operations: []}, operInfoQueue.shift());
    }
  }

  function parseOrderInfo(orderInfo, operInfo)
  {
    var orders = {};

    ordersModule.debug("Parsing orders...");

    var $ = cheerio.load(orderInfo);
    var $tables = $('table');
    var doParseOrderInfoRow = lodash.partial(parseOrderInfoRow, $, orders);

    for (var t = 2; t < $tables.length; ++t)
    {
      $tables.eq(t).find('tr').each(doParseOrderInfoRow);
    }

    ordersModule.debug("Parsed %d orders", $tables.length - 2);

    setImmediate(function()
    {
      if (operInfo)
      {
        parseOperInfo(orders, operInfo);
      }
      else
      {
        compareOrders(orders, {});
      }
    });
  }

  function parseOperInfo(orders, operInfo)
  {
    var missingOrders = {};

    ordersModule.debug("Parsing operations...");

    var $ = cheerio.load(operInfo);
    var $tables = $('table');
    var doParseOperInfoRow = lodash.partial(
      parseOperInfoRow, $, orders, missingOrders
    );

    for (var t = 2; t < $tables.length; ++t)
    {
      $tables.eq(t).find('tr').each(doParseOperInfoRow);
    }

    ordersModule.debug(
      "Parsed %d operations (%d missing orders)",
      $tables.length - 2,
      Object.keys(missingOrders).length
    );

    setImmediate(compareOrders.bind(null, orders, missingOrders));
  }

  function parseOrderInfoRow($, orders, i)
  {
    /*jshint validthis:true*/

    if (i === 0)
    {
      return 0;
    }

    var cells = $(this).find('td').map(function()
    {
      return $(this).text().trim();
    });

    if (cells.length !== 15)
    {
      return 0;
    }

    var nc12 = /^[0-9]{15}$/.test(cells[1]) ? cells[1].substr(3) : cells[1];
    var startDate = cells[10].split('.').map(Number);
    var finishDate = cells[11].split('.').map(Number);
    var statuses = cells[13]
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(function(status) { return status.replace(/\*/g, ''); });

    var order = {
      _id: cells[0],
      createdAt: new Date(),
      updatedAt: null,
      nc12: nc12,
      name: cells[2].replace(/&nbsp;/g, ' '),
      mrp: cells[5],
      qty: parseInt(cells[8], 10),
      unit: cells[9],
      startDate: new Date(startDate[2], startDate[1] - 1, startDate[0]),
      finishDate: new Date(finishDate[2], finishDate[1] - 1, finishDate[0]),
      statuses: statuses,
      operations: null
    };

    orders[order._id] = order;

    return 1;
  }

  function parseOperInfoRow($, orders, missingOrders, i)
  {
    /*jshint validthis:true*/

    if (i === 0)
    {
      return 0;
    }

    var cells = $(this).find('td').map(function()
    {
      return $(this).text().trim();
    });

    if (cells.length !== 10)
    {
      return 0;
    }

    var orderNo = cells[0];
    var operation = {
      no: cells[1],
      workCenter: cells[2],
      name: cells[3].replace(/&nbsp;/g, ' '),
      qty: parseInt(cells[4], 10),
      unit: cells[5],
      machineSetupTime: parseStdValue(cells[6]),
      laborSetupTime: parseStdValue(cells[7]),
      machineTime: parseStdValue(cells[8]),
      laborTime: parseStdValue(cells[9])
    };

    var order = orders[orderNo];

    if (order)
    {
      if (order.operations === null)
      {
        order.operations = [];
      }

      order.operations.push(operation);
    }
    else
    {
      if (typeof missingOrders[orderNo] === 'undefined')
      {
        missingOrders[orderNo] = {
          _id: orderNo,
          operations: []
        };
      }

      missingOrders[orderNo].operations.push(operation);
    }

    return 1;
  }

  function parseStdValue(value)
  {
    value = parseFloat(value.replace(',', '.'));

    return isNaN(value) ? -1 : value;
  }

  function compareOrders(orders, missingOrders)
  {
    var orderIds = Object.keys(orders).concat(Object.keys(missingOrders));
    var insertList = [];
    var updateList = [];

    Order.find({_id: {$in: orderIds}}).exec(function(err, orderModels)
    {
      if (err)
      {
        return ordersModule.error(
          "Failed to fetch orders for comparison: %s", err.message
        );
      }

      orderModels.forEach(
        compareOrder.bind(null, updateList, orders, missingOrders)
      );

      createOrdersForInsertion(insertList, orders, missingOrders);

      saveOrders(insertList, updateList);
    });
  }

  function compareOrder(updateList, orders, missingOrders, orderModel)
  {
    var orderNo = orderModel._id;

    if (typeof orders[orderNo] === 'object')
    {
      compareOrderWithDoc(updateList, orderModel, orders[orderNo]);

      delete orders[orderNo];
    }
    else if (typeof missingOrders[orderNo] === 'object')
    {
      compareMissingOrderWithDoc(
        updateList, orderModel, missingOrders[orderNo]
      );

      delete missingOrders[orderNo];
    }
  }

  function compareOrderWithDoc(updateList, orderModel, order)
  {
    var different = false;
    var changes = {
      time: new Date(),
      user: null,
      oldValues: {},
      newValues: {}
    };

    Object.keys(order).forEach(function(key)
    {
      if (key === 'createdAt' || key === 'updatedAt')
      {
        return;
      }

      var oldValue = orderModel.get(key);
      var newValue = order[key];

      if (oldValue != null && typeof oldValue.toObject === 'function')
      {
        oldValue = oldValue.toObject();
      }

      if (!deepEqual(oldValue, newValue, {strict: true}))
      {
        different = true;

        orderModel.set(key, newValue);

        changes.oldValues[key] = oldValue;
        changes.newValues[key] = newValue;
      }
    });

    if (different)
    {
      orderModel.changes.push(changes);

      updateList.push(orderModel);
    }
  }

  function compareMissingOrderWithDoc(updateList, orderModel, missingOrder)
  {
    var oldOperations = orderModel.get('operations').toObject();

    if (!deepEqual(oldOperations, missingOrder.operations, {strict: true}))
    {
      orderModel.set('operations', missingOrder.operations);
      orderModel.changes.push({
        time: new Date(),
        user: null,
        oldValues: {operations: oldOperations},
        newValues: missingOrder.operations
      });

      updateList.push(orderModel);
    }
  }

  function createOrdersForInsertion(insertList, orders, missingOrders)
  {
    Object.keys(orders).forEach(function(orderNo)
    {
      insertList.push(new Order(orders[orderNo]));
    });

    Object.keys(missingOrders).forEach(function(orderNo)
    {
      insertList.push(new Order(missingOrders[orderNo]));
    });
  }

  function saveOrders(insertList, updateList)
  {
    var createdOrdersCount = insertList.length;
    var updatedOrdersCount = updateList.length;
    var insertBatchCount = Math.ceil(createdOrdersCount / 100);
    var steps = [];

    for (var i = 0; i < insertBatchCount; ++i)
    {
      steps.push(lodash.partial(createOrdersStep, insertList.splice(0, 100)));
    }

    updateList.forEach(function(orderModel)
    {
      steps.push(lodash.partial(updateOrderStep, orderModel));
    });

    steps.push(function unlockDataParsingStep(err)
    {
      if (err)
      {
        return ordersModule.error("Failed to sync data: %s", err.message);
      }

      ordersModule.info(
        "Synced %d new and %d existing orders",
        createdOrdersCount,
        updatedOrdersCount
      );

      if (createdOrdersCount > 0 || updatedOrdersCount > 0)
      {
        app.broker.publish('orders.synced', {
          created: createdOrdersCount,
          updated: updatedOrdersCount
        });
      }

      parseDataLocked = false;

      if (orderInfoQueue.length > 0 && operInfoQueue.length > 0)
      {
        setImmediate(parseData);
      }
    });

    step(steps);
  }

  function createOrdersStep(orders, err)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    Order.create(orders, this.next());
  }

  function updateOrderStep(orderModel, err)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    orderModel.save(this.next());
  }
};
