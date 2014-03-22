'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpLogEntryHandler = require('./logEntryHandler');
var recreate = require('./recreate');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  subdivisionsId: 'subdivisions',
  prodLinesId: 'prodLines',
  downtimeReasonsId: 'downtimeReasons'
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

    var Model;

    switch (type)
    {
      case 'shift':
        Model = ProdShift;
        break;

      case 'order':
        Model = ProdShiftOrder;
        break;

      case 'downtime':
        Model = ProdDowntime;
        break;
    }

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
      module.config.subdivisionsId,
      module.config.prodLinesId
    ],
    setUpLogEntryHandler.bind(null, app, module)
  );
};
