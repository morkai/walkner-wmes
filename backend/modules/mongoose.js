// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

exports.DEFAULT_CONFIG = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: 'mongodb://localhost/test',
  options: {},
  models: null
};

exports.start = function startDbModule(app, module, done)
{
  module = app[module.name] = _.assign(mongoose, module);

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

        return setTimeout(
          function() { tryToConnect(i + 1); },
          module.config.connectAttemptDelay
        );
      }

      initializeAutoIncrement();
      loadModels();
    });
  }

  /**
   * @private
   */
  function loadModels()
  {
    var modelsDir = app.pathTo('models');
    var modelsList = module.config.models || require(app.pathTo('models', 'index'));

    app.loadFiles(modelsDir, modelsList, [app, module], done);
  }

  /**
   * @private
   */
  function initializeAutoIncrement()
  {
    autoIncrement.initialize(module.connection);
  }
};
