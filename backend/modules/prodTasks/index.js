// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = require('../createDictionaryModule')(
  'ProdTask',
  require('./routes'),
  function(app, module)
  {
    app.broker.subscribe('prodTasks.edited', function(message)
    {
      var prodTask = message.model;
      var prodTaskId = prodTask._id.toString();

      lodash.forEach(module.models, function(childProdTask)
      {
        if (childProdTask.parent === null || childProdTask.parent.toString() !== prodTaskId)
        {
          return;
        }

        if (prodTask.parent === null)
        {
          childProdTask.tags = prodTask.tags;
          childProdTask.fteDiv = prodTask.fteDiv;
          childProdTask.inProd = prodTask.inProd;
          childProdTask.clipColor = prodTask.clipColor;
        }
        else
        {
          childProdTask.parent = null;
        }

        childProdTask.save(function(err)
        {
          if (err)
          {
            return module.error(
              "Failed to updated child task [%s] of [%s]: %s",
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
