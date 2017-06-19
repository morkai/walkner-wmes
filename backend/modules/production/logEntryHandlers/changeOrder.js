// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');

  if (logEntry.data.master === undefined)
  {
    copyPersonnelData();
  }
  else
  {
    handleOfflineEntry();
  }

  function copyPersonnelData()
  {
    productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
    {
      if (err)
      {
        productionModule.error(
          'Failed to find prod shift [%s] to copy personnel data (LOG=[%s]): %s',
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );
      }
      else if (prodShift)
      {
        logEntry.data.master = prodShift.master;
        logEntry.data.leader = prodShift.leader;
        logEntry.data.operator = prodShift.operator;
        logEntry.data.operators = prodShift.operators;
      }

      return handleOfflineEntry();
    });
  }

  function handleOfflineEntry()
  {
    if (util.isOfflineEntry(logEntry))
    {
      util.fillOrderData(app, productionModule, logEntry, createProdShiftOrder);
    }
    else
    {
      createProdShiftOrder();
    }
  }

  function createProdShiftOrder(err)
  {
    if (err)
    {
      return done(err);
    }

    step(
      function()
      {
        productionModule.getProdData('shift', logEntry.prodShift, this.parallel());
        productionModule.getProdData('order', logEntry.prodShiftOrder, this.parallel());
        (new ProdShiftOrder(logEntry.data)).save(this.parallel());
      },
      function(err, prodShift, oldProdShiftOrder, newProdShiftOrder)
      {
        if (err && err.code !== 11000)
        {
          productionModule.error('Failed to save a new prod shift order (LOG=[%s]): %s', logEntry._id, err.stack);

          return this.skip(err);
        }

        const prodShiftOrder = newProdShiftOrder || oldProdShiftOrder;

        if (prodShiftOrder)
        {
          productionModule.setProdData(prodShiftOrder);
        }

        if (prodLine.isNew || !prodShift || !prodShiftOrder)
        {
          return this.skip();
        }

        const oldNextOrders = prodShift.getNextOrders();
        const newNextOrders = oldNextOrders.filter(next => next.orderNo !== prodShiftOrder.orderId);

        if (newNextOrders.length !== oldNextOrders.length)
        {
          prodShift.nextOrder = newNextOrders;
          prodShift.save(this.group());
        }

        prodLine.set({
          prodShiftOrder: prodShiftOrder._id,
          prodDowntime: null
        });

        prodLine.save(this.group());
      },
      function(err)
      {
        if (err)
        {
          productionModule.error(
            'Failed to save prod line [%s] after changing the prod shift order to [%s]'
            + ' (LOG=[%s]): %s',
            prodLine._id,
            logEntry.prodShiftOrder,
            logEntry._id,
            err.stack
          );

          return this.skip(err);
        }
      },
      done
    );
  }
};
