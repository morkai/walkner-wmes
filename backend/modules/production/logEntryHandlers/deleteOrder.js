// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  step(
    function getProdDowntimeModelStep()
    {
      productionModule.getProdData('order', logEntry.data._id, this.parallel());
      productionModule.getOrderDowntimes(logEntry.data._id, this.parallel());
    },
    function deleteModelsStep(err, prodShiftOrder, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find models while deleting order [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (!prodShiftOrder)
      {
        productionModule.warn(
          "Order [%s] not found for deletion (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, null);
      }

      this.prodShiftOrder = prodShiftOrder;
      this.prodDowntimes = prodDowntimes;

      prodShiftOrder.remove(this.parallel());

      for (var i = 0, l = prodDowntimes.length; i < l; ++i)
      {
        prodDowntimes[i].set({
          orderId: null,
          mechOrder: null,
          operationNo: null,
          prodShiftOrder: null
        });
        prodDowntimes[i].save(this.parallel());
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
      }
    },
    util.createRecalcShiftTimesStep(productionModule, logEntry),
    done
  );
};
