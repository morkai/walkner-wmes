// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        productionModule.error(
          "Failed to find models while editing shift [%s] (LOG=[%s]): %s",
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      var cachedProdShiftOrders = [];
      var cachedProdDowntimes = [];

      if (Array.isArray(prodShiftOrders))
      {
        productionModule.swapToCachedProdData(prodShiftOrders, cachedProdShiftOrders);
      }

      if (Array.isArray(prodDowntimes))
      {
        productionModule.swapToCachedProdData(prodDowntimes, cachedProdDowntimes);
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
          prodShiftOrder.set(personnelChanges);
          prodShiftOrder.save(step.parallel());
        });

        prodDowntimes.forEach(function(prodDowntime)
        {
          prodDowntime.set(personnelChanges);
          prodDowntime.save(step.parallel());
        });
      }
    },
    done
  );
};
