'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpLogEntryHandler = require('./logEntryHandler');
var setUpActiveProdLines = require('./activeProdLines');
var recreate = require('./recreate');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  subdivisionsId: 'subdivisions',
  prodLinesId: 'prodLines',
  downtimeReasonsId: 'downtimeReasons',
  fteId: 'fte',
  orgUnitsId: 'orgUnits'
};

exports.start = function startProductionModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var cachedProdData = {};

  module.setProdData = function(model)
  {
    cachedProdData[model.get('_id')] = model;
  };

  module.getProdData = function(type, _id, done)
  {
    /*jshint -W015*/

    if (_id === null)
    {
      return done(null, null);
    }

    if (typeof cachedProdData[_id] !== 'undefined')
    {
      return done(null, cachedProdData[_id]);
    }

    var Model = getModelByType(type);

    if (!Model)
    {
      return done(null, null);
    }

    Model.findById(_id, function(err, model)
    {
      if (err)
      {
        return done(err, null);
      }

      if (model !== null)
      {
        cachedProdData[_id] = model;
      }

      return done(null, model);
    });
  };

  module.getCachedProdData = function(_id)
  {
    return cachedProdData[_id] || null;
  };

  module.getMultipleProdData = function(type, idList, done)
  {
    if (!Array.isArray(idList) || idList.length === 0)
    {
      return {};
    }

    if (idList.length === 1)
    {
      return module.getProdData(type, idList[0], function(err, model)
      {
        if (err)
        {
          return done(err, null);
        }

        return done(null, model ? [model] : []);
      });
    }

    var Model = getModelByType(type);

    if (!Model)
    {
      return done(null, null);
    }

    var idToFind = idList.filter(function(id) { return cachedProdData[id] === undefined; });

    if (idToFind.length === 0)
    {
      return mergeModels([]);
    }

    Model.find({_id: {$in: idToFind}}, function(err, models)
    {
      if (err)
      {
        return done(err, null);
      }

      return mergeModels(models);
    });

    function mergeModels(models)
    {
      var prodData = [];

      idList.forEach(function(id)
      {
        if (cachedProdData[id] !== undefined)
        {
          prodData.push(cachedProdData[id]);
        }
      });

      models.forEach(function(model)
      {
        if (cachedProdData[model._id] === undefined)
        {
          module.setProdData(model);

          prodData.push(model);
        }
      });

      return done(null, prodData);
    }
  };

  module.swapToCachedProdData = function(models, cachedModels)
  {
    models.forEach(function(model)
    {
      var cachedModel = module.getCachedProdData(model._id);

      if (cachedModel)
      {
        cachedModels.push(cachedModel);
      }
      else
      {
        module.setProdData(model);
        cachedModels.push(model);
      }
    });
  };

  module.recreating = false;

  module.recreate = recreate.bind(null, app, module);

  app.broker.subscribe('shiftChanged', function clearProdDataCache(newShift)
  {
    var shiftTime = newShift.date.getTime();

    app.timeout(30000, function()
    {
      Object.keys(cachedProdData).forEach(function(_id)
      {
        var model = cachedProdData[_id];

        if (model.get('shift') !== newShift.no && model.get('date').getTime() !== shiftTime)
        {
          delete cachedProdData[_id];
        }
      });
    });
  });

  app.broker.subscribe('hourlyPlans.quantitiesPlanned', function(message)
  {
    if (!module.recreating)
    {
      app.broker.publish('production.edited.shift.' + message.prodShift, {
        quantitiesDone: message.quantitiesDone
      });
    }
  });

  app.onModuleReady(
    [
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.userId,
      module.config.sioId,
      module.config.prodLinesId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.fteId,
      module.config.orgUnitsId
    ],
    setUpActiveProdLines.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.subdivisionsId,
      module.config.prodLinesId
    ],
    setUpLogEntryHandler.bind(null, app, module)
  );

  function getModelByType(type)
  {
    /*jshint -W015*/

    switch (type)
    {
      case 'shift':
        return ProdShift;

      case 'order':
        return ProdShiftOrder;

      case 'downtime':
        return ProdDowntime;

      default:
        return null;
    }
  }
};
