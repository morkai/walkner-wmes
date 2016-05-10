// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

exports.DEFAULT_CONFIG = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: 'mongodb://localhost/test',
  options: {},
  models: null,
  keepAliveQueryInterval: 30000
};

exports.start = function startDbModule(app, module, done)
{
  let keepAliveFailed = false;

  module = app[module.name] = _.assign(mongoose, module);

  module.connection.on('connecting', () => module.debug('Connecting...'));
  module.connection.on('connected', () => module.debug('Connected.'));
  module.connection.on('open', () => module.warn('Open.'));
  module.connection.on('reconnected', () => module.debug('Reconnected.'));
  module.connection.on('disconnecting', () => module.warn('Disconnecting...'));
  module.connection.on('disconnected', () => module.warn('Disconnected.'));
  module.connection.on('close', () => module.warn('Closed.'));
  module.connection.on('unauthorized', () => module.warn('Unauthorized.'));
  module.connection.on('error', (err) => module.error(err.stack));

  tryToConnect(0);

  /**
   * @private
   * @param {number} i
   */
  function tryToConnect(i)
  {
    module.connect(module.config.uri, module.config.options, function(err)
    {
      if (err)
      {
        if (i === module.config.maxConnectTries)
        {
          return done(err);
        }

        return setTimeout(tryToConnect.bind(null, i + 1), module.config.connectAttemptDelay);
      }

      initializeAutoIncrement();
      loadModels();
      setUpKeepAliveQuery();
    });
  }

  /**
   * @private
   */
  function loadModels()
  {
    const modelsDir = app.pathTo('models');
    const modelsList = module.config.models || require(app.pathTo('models', 'index'));

    app.loadFiles(modelsDir, modelsList, [app, module], done);
  }

  /**
   * @private
   */
  function initializeAutoIncrement()
  {
    autoIncrement.initialize(module.connection);
  }

  function setUpKeepAliveQuery()
  {
    if (!module.config.keepAliveQueryInterval)
    {
      return;
    }

    module.connection.db.stats(function(err, stats)
    {
      if (err)
      {
        if (!keepAliveFailed)
        {
          module.error(`Keep alive query failed: ${err.message}`);
        }

        keepAliveFailed = true;
      }
      else
      {
        if (keepAliveFailed)
        {
          module.debug(`Kept alive: ${JSON.stringify(stats)}`);
        }

        keepAliveFailed = false;
      }

      setTimeout(setUpKeepAliveQuery, module.config.keepAliveQueryInterval);
    });
  }
};
