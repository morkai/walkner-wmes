// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const Order = mongoose.model('Order');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');

  step(
    function()
    {
      productionModule.getProdData('order', logEntry.data._id, this.next());
    },
    function(err, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          'Failed to get the prod shift order [%s] to finish (LOG=[%s]): %s',
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      if (!prodShiftOrder)
      {
        productionModule.warn(
          "Couldn't find prod shift order [%s] to finish (LOG=[%s])",
          logEntry.data._id,
          logEntry._id
        );

        return this.skip();
      }

      if (prodShiftOrder.finishedAt
        && prodShiftOrder.finishedAt <= Date.parse(logEntry.data.finishedAt))
      {
        productionModule.warn(
          'Tried to finish an already finished prod shift order [%s] (LOG=[%s])',
          logEntry.data._id,
          logEntry._id
        );

        return this.skip();
      }

      this.prodShiftOrder = prodShiftOrder;

      Order.findById(prodShiftOrder.orderId, {operations: 1}).lean().exec(this.next());
    },
    function(err, order)
    {
      if (err)
      {
        return this.skip(err);
      }

      ProdShiftOrder.copyOperationData(this.prodShiftOrder, order.operations);

      this.prodShiftOrder.finishedAt = logEntry.data.finishedAt;

      this.prodShiftOrder.recalcDurations(false, this.next());
    },
    function(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to recalculate durations of prod shift order [%s] (LOG=[%s]): %s',
          this.prodShiftOrder._id,
          logEntry._id,
          err.stack
        );
      }

      this.prodShiftOrder.save(this.next());
    },
    done
  );
};
