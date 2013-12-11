'use strict';

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

      module.models = [];
      module.modelsById = {};

      if (setUpRoutes)
      {
        app.onModuleReady(
          [
            module.config.userId,
            module.config.expressId
          ],
          setUpRoutes.bind(null, app, module)
        );
      }

      app.broker.subscribe(Model.TOPIC_PREFIX + '.*', function()
      {
        fetchData(function(err)
        {
          if (err)
          {
            module.error("Failed to fetch data: %s", err.message);
          }
        });
      });

      fetchData(done);

      function fetchData(done)
      {
        var query = Model.findForDictionary
          ? Model.findForDictionary()
          : Model.find();

        query.exec(function(err, models)
        {
          if (err)
          {
            return done(err);
          }

          module.models = models;
          module.modelsById = {};

          models.forEach(function(model)
          {
            module.modelsById[model.get('_id')] = model;
          });

          done();
        });
      }
    }
  };
};
