// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function setUpProdData(app, productionModule)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var cachedProdData = {};

  productionModule.clearProdData = function()
  {
    cachedProdData = {};
  };

  productionModule.clearStaleProdData = function()
  {
    var currentShiftTime = app[productionModule.config.fteId].getCurrentShift().date.getTime();

    lodash.forEach(cachedProdData, function(model, _id)
    {
      if (model.date.getTime() !== currentShiftTime)
      {
        delete cachedProdData[_id];
      }
    });
  };

  productionModule.setProdData = function(model)
  {
    cachedProdData[model._id] = model;
  };

  productionModule.getProdData = function(type, _id, done)
  {
    /*jshint -W015*/

    if (_id === null)
    {
      return done(null, null);
    }

    if (cachedProdData[_id] !== undefined)
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
      if (cachedProdData[_id] !== undefined)
      {
        return done(null, cachedProdData[_id]);
      }

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

  productionModule.getCachedProdData = function(_id)
  {
    return cachedProdData[_id] || null;
  };

  productionModule.getMultipleProdData = function(type, idList, done)
  {
    if (!Array.isArray(idList) || idList.length === 0)
    {
      return {};
    }

    if (idList.length === 1)
    {
      return productionModule.getProdData(type, idList[0], function(err, model)
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

      lodash.forEach(idList, function(id)
      {
        if (cachedProdData[id] !== undefined)
        {
          prodData.push(cachedProdData[id]);
        }
      });

      lodash.forEach(models, function(model)
      {
        if (cachedProdData[model._id] === undefined)
        {
          productionModule.setProdData(model);

          prodData.push(model);
        }
      });

      return done(null, prodData);
    }
  };

  productionModule.swapToCachedProdData = function(models, cachedModels)
  {
    lodash.forEach(models, function(model)
    {
      var cachedModel = productionModule.getCachedProdData(model._id);

      if (cachedModel)
      {
        cachedModels.push(cachedModel);
      }
      else
      {
        productionModule.setProdData(model);
        cachedModels.push(model);
      }
    });
  };

  productionModule.getProdShiftOrders = function(prodShiftId, done)
  {
    ProdShiftOrder.find({prodShift: prodShiftId}).sort({startedAt: 1}).exec(function(err, prodShiftOrders)
    {
      if (err)
      {
        return done(err);
      }

      var cachedProdShiftModels = [];

      productionModule.swapToCachedProdData(prodShiftOrders, cachedProdShiftModels);

      return done(null, cachedProdShiftModels);
    });
  };

  productionModule.getProdDowntimes = function(prodShiftId, done)
  {
    ProdDowntime.find({prodShift: prodShiftId}).sort({startedAt: 1}).exec(function(err, prodDowntimes)
    {
      if (err)
      {
        return done(err);
      }

      var cachedProdDowntimes = [];

      productionModule.swapToCachedProdData(prodDowntimes, cachedProdDowntimes);

      return done(null, cachedProdDowntimes);
    });
  };

  productionModule.getProdShiftQuantitiesDone = function(prodLineId, shiftDates, done)
  {
    ProdShift
      .find({date: {$in: shiftDates}, prodLine: prodLineId}, {date: 1, shift: 1, quantitiesDone: 1})
      .lean()
      .exec(done);
  };

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
