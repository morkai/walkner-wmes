// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var createParser = require('./createParser');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  orderStepCount: 1,
  operStepCount: 1,
  filterRe: /^Job PL02_(ORDER|OPER)_INFO_1D, Step ([0-9]+)\.html?$/
};

exports.start = function startEmptyOrdersImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("orders/importer/emptyOrders module requires the mongoose module!");
  }

  var EmptyOrder = mongoose.model('EmptyOrder');

  createParser(app, module, handleParseResult);

  function handleParseResult(orders)
  {
    var emptyOrders = [];

    Object.keys(orders).forEach(function(orderId)
    {
      var order = orders[orderId];

      if (order.operations === null)
      {
        emptyOrders.push(new EmptyOrder(order).toObject({depopulate: true}));
      }
    });

    if (emptyOrders.length === 0)
    {
      return publishMessage(0);
    }

    EmptyOrder.collection.insert(emptyOrders, {continueOnError: true}, function(err, docs)
    {
      if (err)
      {
        module.error("Error during insertion of empty orders: %s", err.message);
      }

      publishMessage(Array.isArray(docs) ? docs.length : 0);
    });
  }

  function publishMessage(count)
  {
    module.info("Synced %d empty orders", count);

    app.broker.publish('emptyOrders.synced', {count: count});
  }
};
