// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const Order = app[productionModule.config.mongooseId].model('Order');

  step(
    function()
    {
      productionModule.getProdData('order', logEntry.prodShiftOrder, this.next());
    },
    function(err, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          "Failed to get prod shift order [%s] to change the quantity done (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      if (!prodShiftOrder)
      {
        productionModule.warn(
          "Couldn't find prod shift order [%s] to change the quantity done (LOG=[%s])",
          logEntry.prodShiftOrder,
          logEntry._id
        );

        return this.skip();
      }

      prodShiftOrder.quantityDone = Math.max(logEntry.data.newValue || 0, 0);

      prodShiftOrder.save(this.next());
    },
    function(err, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod shift order [%s] after changing the quantity done (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      Order.recountQtyDone(prodShiftOrder.orderId, this.next());
    },
    function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to recount the total quantity done after changing the quantity done of [%s] (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }
    },
    done
  );
};
