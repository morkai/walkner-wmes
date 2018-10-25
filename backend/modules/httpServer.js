// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const util = require('util');
const http = require('http');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  host: '0.0.0.0',
  port: 80,
  availabilityTopics: []
};

exports.start = function startHttpServerModule(app, module, done)
{
  let availabilityTopics = module.config.availabilityTopics.slice();

  availabilityTopics.forEach(topic =>
  {
    app.broker.subscribe(topic).setLimit(1).on('message', () =>
    {
      availabilityTopics = availabilityTopics.filter(t => t !== topic);
    });
  });

  module.isAvailable = () => availabilityTopics.length === 0;

  function onFirstServerError(err)
  {
    if (err.code === 'EADDRINUSE')
    {
      return done(new Error(util.format(
        'port %d already in use?', module.config.port
      )));
    }

    return done(err);
  }

  module.server = http.createServer(function onRequest(req, res)
  {
    const expressModule = app[module.config.expressId];

    if (module.isAvailable() && expressModule)
    {
      expressModule.app(req, res);
    }
    else
    {
      res.writeHead(503);
      res.end();
    }
  });

  module.server.once('error', onFirstServerError);

  module.server.listen(module.config.port, module.config.host, function()
  {
    module.server.removeListener('error', onFirstServerError);

    module.debug('Listening on port %d...', module.config.port);

    return done();
  });
};
