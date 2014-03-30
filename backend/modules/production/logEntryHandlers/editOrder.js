'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');

  var changes = logEntry.data;
  var changeDowntimes = changes.orderId !== undefined
    || changes.operationNo !== undefined
    || changes.master !== undefined
    || changes.leader !== undefined
    || changes.operator !== undefined
    || changes.operators !== undefined;

  step(
    function getModelsStep()
    {
      productionModule.getProdData('order', logEntry.prodShiftOrder, this.parallel());

      if (changeDowntimes)
      {
        ProdDowntime.find({prodShiftOrder: logEntry.prodShiftOrder}, this.parallel());
      }
    },
    function swapToCachedModelsStep(err, prodShiftOrder, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find models while editing order [%s] (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      var cachedProdDowntimes = [];

      if (Array.isArray(prodDowntimes))
      {
        productionModule.swapToCachedProdData(prodDowntimes, cachedProdDowntimes);
      }

      setImmediate(this.next().bind(null, prodShiftOrder, cachedProdDowntimes));
    },
    function updateModelsStep(prodShiftOrder, prodDowntimes)
    {
      prodShiftOrder.set(changes);
      prodShiftOrder.save(this.parallel());

      if (changeDowntimes)
      {
        var downtimeChanges = {};

        ['master', 'leader', 'operator', 'operators'].forEach(function(personnelProperty)
        {
          if (changes[personnelProperty] !== undefined)
          {
            downtimeChanges[personnelProperty] = changes[personnelProperty];
          }
        });

        if (changes.orderId !== undefined)
        {
          downtimeChanges.mechOrder = changes.mechOrder;
          downtimeChanges.orderId = changes.orderId;
        }

        if (changes.operationNo !== undefined)
        {
          downtimeChanges.operationNo = changes.operationNo;
        }

        var step = this;

        prodDowntimes.forEach(function(prodDowntime)
        {
          prodDowntime.set(downtimeChanges);
          prodDowntime.save(step.parallel());
        });
      }
    },
    done
  );
};
