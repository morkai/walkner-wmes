// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

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
      const mongoose = app[module.config.mongooseId];

      if (!mongoose)
      {
        return done(new Error('mongoose module is required'));
      }

      const Model = mongoose.model(modelName);

      module.Model = Model;
      module.models = [];
      module.modelsById = {};
      module.updatedAt = Date.now();

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

      app.broker.subscribe(Model.TOPIC_PREFIX + '.added', function(message, topic, meta)
      {
        module.models.push(message.model);
        module.modelsById[message.model._id] = message.model;

        publishDictionaryUpdate(topic, message, meta);
      });

      app.broker.subscribe(Model.TOPIC_PREFIX + '.edited', function(message, topic, meta)
      {
        publishDictionaryUpdate(topic, message, meta);
      });

      app.broker.subscribe(Model.TOPIC_PREFIX + '.deleted', function(message, topic, meta)
      {
        module.models = _.filter(module.models, function(model)
        {
          return model._id !== message.model._id;
        });

        delete module.modelsById[message.model._id];

        publishDictionaryUpdate(topic, message, meta);
      });

      if (typeof customSetUp === 'function')
      {
        customSetUp(app, module);
      }

      fetchData(done);

      function fetchData(done)
      {
        const query = Model.findForDictionary ? Model.findForDictionary() : Model.find();

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

      function publishDictionaryUpdate(topic, message, meta)
      {
        module.updatedAt = Date.now();

        app.broker.publish('dictionaries.updated', {
          topic: topic,
          message: message,
          meta: meta
        });
      }
    }
  };
};
