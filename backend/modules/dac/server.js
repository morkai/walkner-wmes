// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  messengerServerId: 'messenger/server',
  expressId: 'express'
};

exports.start = function startDacNodeModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.messengerServerId
    ],
    setUpMessengerServer
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  function setUpMessengerServer()
  {
    var server = app[module.config.messengerServerId];

    server.handle('dac.log', handleLogRequest);
  }

  function handleLogRequest(req, reply)
  {
    app[module.config.mongooseId].model('DacLogEntry').importData(req, function(err, docs)
    {
      if (err)
      {
        module.error(
          "Failed to create log entries from data sent by node [%s]: %s", req.nodeId, err.message
        );
      }
      else
      {
        app.broker.publish('dac.synced', {nodeId: req.nodeId, count: docs.length});
      }

      reply(err);
    });
  }
};
