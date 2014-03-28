'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');

  var changes = logEntry.data;
  var personnelChanged = changes.master !== undefined
    || changes.leader !== undefined
    || changes.operator !== undefined
    || changes.operators !== undefined;

  step(
    function getModelsStep()
    {
      productionModule.getProdData('shift', logEntry.prodShift, this.parallel());

      if (personnelChanged)
      {
        ProdShiftOrder.find({prodShift: logEntry.prodShift}, this.parallel());
        ProdDowntime.find({prodShift: logEntry.prodShift}, this.parallel());
      }
    },
    function swapToCachedModelsStep(err, prodShift, prodShiftOrders, prodDowntimes)
    {
      if (err)
      {
        return this.done(done, err);
      }

      var cachedProdShiftOrders = [];
      var cachedProdDowntimes = [];

      if (Array.isArray(prodShiftOrders))
      {
        swapToCachedModels(prodShiftOrders, cachedProdShiftOrders);
      }

      if (Array.isArray(prodDowntimes))
      {
        swapToCachedModels(prodDowntimes, cachedProdDowntimes);
      }

      setImmediate(this.next().bind(null, prodShift, cachedProdShiftOrders, cachedProdDowntimes));
    },
    function updateModelsStep(prodShift, prodShiftOrders, prodDowntimes)
    {
      prodShift.set(changes);
      prodShift.save(this.parallel());

      if (personnelChanged)
      {
        var personnelChanges = {};

        ['master', 'leader', 'operator', 'operators'].forEach(function(personnelProperty)
        {
          if (changes[personnelProperty] !== undefined)
          {
            personnelChanges[personnelProperty] = changes[personnelProperty];
          }
        });

        var step = this;

        prodShiftOrders.forEach(function(prodShiftOrder)
        {
          var done = step.parallel();

          prodShiftOrder.set(personnelChanges);
          prodShiftOrder.save(function(err, prodShiftOrder)
          {
            if (!err)
            {
              app.broker.publish(
                'prodShiftOrders.updated.' + prodShiftOrder._id,
                personnelChanges
              );
            }

            done(err);
          });
        });

        prodDowntimes.forEach(function(prodDowntime)
        {
          var done = step.parallel();

          prodDowntime.set(personnelChanges);
          prodDowntime.save(function(err, prodDowntime)
          {
            if (!err)
            {
              app.broker.publish(
                'prodDowntimes.updated.' + prodDowntime._id,
                personnelChanges
              );
            }

            done(err);
          });
        });
      }
    },
    done
  );

  function swapToCachedModels(models, cachedModels)
  {
    models.forEach(function(model)
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
  }
};
