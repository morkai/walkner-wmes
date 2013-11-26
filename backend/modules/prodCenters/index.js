'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user'
};

exports.start = function startProdCentersModule(app, module, done)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    return done(new Error("mongoose module is required"));
  }

  module.data = [];

  app.onModuleReady(
    [
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.broker.subscribe('prodCenters.*', function()
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
    mongoose.model('ProdCenter')
      .find()
      .sort({_id: 1})
      .exec(function(err, prodCenters)
      {
        if (err)
        {
          return done(err);
        }

        module.data = prodCenters;

        done();
      });
  }
};
