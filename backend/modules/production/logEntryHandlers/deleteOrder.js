// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');

  step(
    function getProdDowntimeModelStep()
    {
      productionModule.getProdData('order', logEntry.data._id, this.parallel());
      ProdDowntime.find({prodShiftOrder: logEntry.data._id}, this.parallel());
    },
    function swapToCachedModelsStep(err, prodShiftOrder, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find models while deleting order [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      var cachedProdDowntimes = [];

      if (Array.isArray(prodDowntimes))
      {
        productionModule.swapToCachedProdData(prodDowntimes, cachedProdDowntimes);
      }

      setImmediate(this.next().bind(null, prodShiftOrder, cachedProdDowntimes));
    },
    function deleteModelsStep(prodShiftOrder, prodDowntimes)
    {
      this.prodShiftOrder = prodShiftOrder;
      this.prodDowntimes = prodDowntimes;

      prodShiftOrder.remove(this.parallel());

      for (var i = 0, l = prodDowntimes.length; i < l; ++i)
      {
        prodDowntimes[i].remove(this.parallel());
      }
    },
    function broadcastStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to delete order [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      if (!productionModule.recreating)
      {
        app.broker.publish('prodShiftOrders.deleted.' + this.prodShiftOrder._id, {
          _id: this.prodShiftOrder._id,
          prodShift: this.prodShiftOrder.prodShift,
          prodLine: this.prodShiftOrder.prodLine,
          orderId: this.prodShiftOrder.orderId,
          operationNo: this.prodShiftOrder.operationNo,
          shift: this.prodShiftOrder.shift
        });

        for (var i = 0, l = this.prodDowntimes.length; i < l; ++i)
        {
          var prodDowntime = this.prodDowntimes[i];

          app.broker.publish('prodDowntimes.deleted.' + prodDowntime._id, {
            _id: prodDowntime._id,
            rid: prodDowntime.rid,
            prodLine: prodDowntime.prodLine,
            prodShift: prodDowntime.prodShift,
            prodShiftOrder: prodDowntime.prodShiftOrder
          });
        }
      }
    },
    done
  );
};
