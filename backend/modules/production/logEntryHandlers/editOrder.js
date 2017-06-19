// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const Order = mongoose.model('Order');
  const changes = logEntry.data;

  step(
    function getModelsStep()
    {
      productionModule.getProdData('order', logEntry.prodShiftOrder, this.parallel());

      if (changes.startedAt || changes.finishedAt)
      {
        productionModule.getProdDowntimes(logEntry.prodShift, this.parallel());
      }
      else if (changes.orderId !== undefined
        || changes.operationNo !== undefined
        || changes.master !== undefined
        || changes.leader !== undefined
        || changes.operator !== undefined
        || changes.operators !== undefined
        || changes.workerCount !== undefined)
      {
        productionModule.getOrderDowntimes(logEntry.prodShiftOrder, this.parallel());
      }
    },
    function updateModelsStep(err, prodShiftOrder, prodDowntimes)
    {
      if (err)
      {
        productionModule.error(
          'Failed to find order [%s] for edit (LOG=[%s]): %s',
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (!prodShiftOrder)
      {
        productionModule.warn(
          'Order [%s] not found for edit (LOG=[%s])',
          logEntry.prodShiftOrder,
          logEntry._id
        );

        return this.done(done, null);
      }

      this.prodShiftOrder = prodShiftOrder;
      this.prodDowntimes = Array.isArray(prodDowntimes) ? prodDowntimes : [];

      prodShiftOrder.set(changes);
      prodShiftOrder.save(this.next());
    },
    function changeDowntimesStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to save order [%s] after editing (LOG=[%s]): %s',
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (!this.prodDowntimes.length)
      {
        return;
      }

      let l = this.prodDowntimes.length;
      let i;
      let prodDowntime;
      let downtimeChanges;

      if (!changes.startedAt && !changes.finishedAt)
      {
        if (l === 0)
        {
          return;
        }

        downtimeChanges = {};

        _.forEach([
          'master',
          'leader',
          'operator',
          'operators',
          'orderId',
          'mechOrder',
          'operationNo',
          'workerCount'
        ], function(property)
        {
          if (changes[property] !== undefined)
          {
            downtimeChanges[property] = changes[property];
          }
        });

        for (i = 0; i < l; ++i)
        {
          prodDowntime = this.prodDowntimes[i];

          prodDowntime.set(downtimeChanges);
          prodDowntime.save(this.parallel());
        }

        return;
      }

      const prodShiftOrder = this.prodShiftOrder;
      const orderStartedAt = prodShiftOrder.startedAt;
      const orderFinishedAt = prodShiftOrder.finishedAt;
      const orderDowntimes = [];
      const idleDowntimes = [];

      for (i = 0; i < l; ++i)
      {
        prodDowntime = this.prodDowntimes[i];

        const duringOrder = prodDowntime.startedAt >= orderStartedAt && prodDowntime.startedAt <= orderFinishedAt;
        const sameOrder = prodDowntime.prodShiftOrder === prodShiftOrder._id;
        const noOrder = prodDowntime.prodShiftOrder === null;

        if (duringOrder && (sameOrder || noOrder))
        {
          orderDowntimes.push(prodDowntime);
        }
        else if (sameOrder)
        {
          idleDowntimes.push(prodDowntime);
        }
      }

      downtimeChanges = {
        master: prodShiftOrder.master,
        leader: prodShiftOrder.leader,
        operator: prodShiftOrder.operator,
        operators: prodShiftOrder.operators,
        orderId: prodShiftOrder.orderId,
        mechOrder: prodShiftOrder.mechOrder,
        operationNo: prodShiftOrder.operationNo,
        prodShiftOrder: prodShiftOrder._id,
        workerCount: prodShiftOrder.workerCount
      };

      for (i = 0, l = orderDowntimes.length; i < l; ++i)
      {
        prodDowntime = orderDowntimes[i];

        prodDowntime.set(downtimeChanges);
        prodDowntime.save(this.parallel());
      }

      downtimeChanges = {
        orderId: null,
        mechOrder: null,
        operationNo: null,
        prodShiftOrder: null,
        workerCount: 1
      };

      for (i = 0, l = idleDowntimes.length; i < l; ++i)
      {
        prodDowntime = idleDowntimes[i];

        prodDowntime.set(downtimeChanges);
        prodDowntime.save(this.parallel());
      }
    },
    function recalcOrderDurationsStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to save downtimes after editing order [%s] (LOG=[%s]): %s',
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (changes.quantityDone !== undefined)
      {
        Order.recountQtyDone(this.prodShiftOrder.orderId, this.parallel());
      }

      if (changes.startedAt || changes.finishedAt)
      {
        this.prodShiftOrder.recalcDurations(true, this.parallel());
      }
    },
    util.createRecalcShiftTimesStep(productionModule, logEntry),
    done
  );
};
