'use strict';

var createParser = require('./createParser');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  stepCount: 1
};

exports.start = function startEmptyOrdersImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("orders/importer/emptyOrders module requires the mongoose module!");
  }

  var EmptyOrder = mongoose.model('EmptyOrder');
  var filterRe = /^Job PL02_(ORDER|OPER)_INFO_[0-9]+D, Step ([0-9]+)\.html?$/;

  createParser(app, module, filterRe, module.config.stepCount, handleParseResult);

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
