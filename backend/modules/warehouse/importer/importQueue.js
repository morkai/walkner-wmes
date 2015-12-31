// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

exports.DEFAULT_CONFIG = {

};

exports.start = function startWarehouseImportQueueModule(app, module)
{
  /*jshint unused:false*/

  var queue = [];
  var working = false;
  var nextTimer = null;

  app.broker.subscribe('warehouse.importQueue.push', function(message)
  {
    queue.push({
      timestamp: message.timestamp,
      type: message.type,
      data: message.data
    });

    sort();
    next();
  });

  function sort()
  {
    queue.sort(function(a, b)
    {
      return a.timestamp - b.timestamp;
    });
  }

  function next()
  {
    if (working || queue.length === 0)
    {
      return;
    }

    if (nextTimer !== null)
    {
      clearTimeout(nextTimer);
    }

    nextTimer = setTimeout(doNext, 100);
  }

  function doNext()
  {
    nextTimer = null;
    working = true;

    var item = queue.shift();
    var itemBroker = app.broker.sandbox();

    itemBroker.subscribe('warehouse.' + item.type + '.synced', done.bind(null, itemBroker));
    itemBroker.subscribe('warehouse.' + item.type + '.syncFailed', done.bind(null, itemBroker));
    itemBroker.publish('warehouse.importQueue.' + item.type, item.data);
  }

  function done(itemBroker)
  {
    working = false;

    itemBroker.destroy();

    next();
  }
};
