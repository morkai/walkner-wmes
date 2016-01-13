// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function createDictionaryModule(modelName, setUpRoutes, customSetUp)
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
        module.models = _.filter(module.models, function(model)
        {
          return model._id !== message.model._id;
        });

        delete module.modelsById[message.model._id];
      });

      if (typeof customSetUp === 'function')
      {
        customSetUp(app, module);
      }

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

          module.models = new Array(models.length);
          module.modelsById = {};

          _.forEach(models, function(model, i)
          {
            module.models[i] = model;
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
