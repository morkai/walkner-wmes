// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
