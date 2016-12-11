// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');
var util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var Order = mongoose.model('Order');

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

      Order.recountQtyDone(this.prodShiftOrder.orderId, this.next());
    },
    util.createRecalcShiftTimesStep(productionModule, logEntry),
    done
  );
};
