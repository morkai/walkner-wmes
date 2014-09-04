// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function createDictionaryModule(modelName, setUpRoutes)
{
  return {
    DEFAULT_CONFIG: {
      mongooseId: 'mongoose',
      expressId: 'express',
      userId: 'user'
    },
    start: function startDictionaryModule(app, module, done)
    {
      var mongoose = app[module.config.mongooseId];

      if (!mongoose)
      {
        return done(new Error("mongoose module is required"));
      }

      var Model = mongoose.model(modelName);

      module.Model = Model;
      module.models = [];
      module.modelsById = {};

      if (setUpRoutes)
      {
        app.onModuleReady(
          [
            module.config.userId,
            module.config.expressId
          ],
          setUpRoutes.bind(null, app, module, useDictionaryModel)
        );
      }

      app.broker.subscribe(Model.TOPIC_PREFIX + '.added', function(message)
      {
        module.models.push(message.model);
        module.modelsById[message.model._id] = message.model;
      });

      app.broker.subscribe(Model.TOPIC_PREFIX + '.deleted', function(message)
      {
        module.models = lodash.filter(module.models, function(model)
        {
          return model._id !== message.model._id;
        });

        delete module.modelsById[message.model._id];
      });

      fetchData(done);

      function fetchData(done)
      {
        var query = Model.findForDictionary ? Model.findForDictionary() : Model.find();

        query.exec(function(err, models)
        {
          if (err)
          {
            return done(err);
          }

          module.models = models;
          module.modelsById = {};

          lodash.forEach(models, function(model)
          {
            module.modelsById[model._id] = model;
          });

          done();
        });
      }

      function useDictionaryModel(req, res, next)
      {
        req.model = module.modelsById[req.params.id] || null;

        next();
      }
    }
  };
};
