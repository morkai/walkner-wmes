// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = require('../createDictionaryModule')(
  'ProdTask',
  require('./routes'),
  function(app, module)
  {
    app.broker.subscribe('prodTasks.edited', function(message)
    {
      var prodTask = message.model;
      var prodTaskId = prodTask._id.toString();

      _.forEach(module.models, function(childProdTask)
      {
        if (childProdTask.parent === null || childProdTask.parent.toString() !== prodTaskId)
        {
          return;
        }

        childProdTask.tags = prodTask.tags;

        childProdTask.save(function(err)
        {
          if (err)
          {
            return module.error(
              "Failed to update child task [%s] of [%s]: %s",
              childProdTask._id,
              prodTaskId,
              err.message
            );
          }

          app.broker.publish('prodTasks.edited', {
            model: childProdTask,
            user: message.user
          });
        });
      });
    });
  }
);
