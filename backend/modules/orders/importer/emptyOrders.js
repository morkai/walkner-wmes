// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var createParser = require('./createParser');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_WMES_EMPTY_(ORDERS|OPERS)_([0-9]+)\.txt$/,
  parsedOutputDir: null
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

  function handleParseResult(err, orders)
  {
    if (err)
    {
      return;
    }

    var emptyOrders = [];

    _.forEach(orders, function(order)
    {
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
