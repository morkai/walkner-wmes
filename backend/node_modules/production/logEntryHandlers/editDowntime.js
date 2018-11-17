// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const changes = logEntry.data;
  const prodDowntimeId = changes._id;

  function changeOrderIfNecessary(prodDowntime, done)
  {
    step(
      function findOldOrderStep()
      {
        if (prodDowntime.prodShiftOrder)
        {
          productionModule.getProdData('order', prodDowntime.prodShiftOrder, this.next());
        }
      },
      function checkTimesStep(err, oldProdShiftOrder)
      {
        if (err)
        {
          productionModule.error(
            'Failed to find old order [%s] while editing downtime [%s] (LOG=[%s]): %s',
            changes.prodShiftOrder,
            prodDowntimeId,
            logEntry._id,
            err.stack
          );

          return this.done(done, err, null, null, null);
        }

        if (prodDowntime.prodShiftOrder && !oldProdShiftOrder)
        {
          productionModule.warn(
            'Old order [%s] not found while editing downtime [%s] (LOG=[%s])',
            changes.prodShiftOrder,
            prodDowntimeId,
            logEntry._id
          );

          return this.done(done, null, prodDowntime, null, null);
        }

        this.downtimeStartedAt = changes.startedAt ? new Date(changes.startedAt) : prodDowntime.startedAt;
        this.oldProdShiftOrder = oldProdShiftOrder;
        this.newProdShiftOrder = null;

        productionModule.getProdShiftOrders(prodDowntime.prodShift, this.next());
      },
      function findNewOrderStep(err, allProdShiftOrders)
      {
        if (err)
        {
          productionModule.error(
            'Failed to find all orders while editing downtime [%s] (LOG=[%s]): %s',
            prodDowntimeId,
            logEntry._id,
            err.stack
          );

          return this.done(done, err, null, null, null);
        }

        allProdShiftOrders.sort(function(a, b) { return a.startedAt - b.startedAt; });

        const now = new Date();

        for (let i = 0, l = allProdShiftOrders.length; i < l; ++i)
        {
          const newProdShiftOrder = allProdShiftOrders[i];
          const orderFinishedAt = newProdShiftOrder.finishedAt || now;

          if (this.downtimeStartedAt >= newProdShiftOrder.startedAt && this.downtimeStartedAt <= orderFinishedAt)
          {
            this.newProdShiftOrder = newProdShiftOrder;
          }
        }
      },
      function changeOrdersStep()
      {
        if (this.newProdShiftOrder === null)
        {
          changes.prodShiftOrder = null;
          changes.mechOrder = null;
          changes.orderId = null;
          changes.operationNo = null;
          changes.workerCount = 1;
        }
        else
        {
          changes.prodShiftOrder = this.newProdShiftOrder._id;
          changes.mechOrder = this.newProdShiftOrder.mechOrder;
          changes.orderId = this.newProdShiftOrder.orderId;
          changes.operationNo = this.newProdShiftOrder.operationNo;
          changes.workerCount = this.newProdShiftOrder.workerCount;
        }

        done(
          null,
          prodDowntime,
          this.oldProdShiftOrder,
          this.oldProdShiftOrder === this.newProdShiftOrder ? null : this.newProdShiftOrder
        );

        this.oldProdShiftOrder = null;
        this.newProdShiftOrder = null;
      }
    );
  }

  step(
    function getProdDowntimeModelStep()
    {
      productionModule.getProdData('downtime', prodDowntimeId, this.next());
    },
    function getProdShiftOrderModelStep(err, prodDowntime)
    {
      if (err)
      {
        productionModule.error(
          'Failed to find downtime [%s] to edit (LOG=[%s]): %s',
          prodDowntimeId,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      const next = this.next();

      if (changes.startedAt || changes.finishedAt)
      {
        changeOrderIfNecessary(prodDowntime, next);
      }
      else
      {
        next(null, prodDowntime, null, null);
      }
    },
    function updateProdDowntimeStep(err, prodDowntime, oldProdShiftOrder, newProdShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          'Failed to find downtime [%s] to edit (LOG=[%s]): %s',
          prodDowntimeId,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      this.oldProdShiftOrder = oldProdShiftOrder;
      this.newProdShiftOrder = newProdShiftOrder;

      delete changes._id;

      const newValues = _.pick(changes, [
        'startedAt',
        'finishedAt',
        'master',
        'leader',
        'operator',
        'reason',
        'aor',
        'status'
      ]);
      const changeData = {};
      const comment = (changes.decisionComment || changes.reasonComment || '').trim();

      _.forEach(newValues, function(newValue, property)
      {
        changeData[property] = [prodDowntime[property], newValue];
      });

      prodDowntime.set(changes);

      if (!_.isEmpty(changeData) || !_.isEmpty(comment))
      {
        prodDowntime.changes.push({
          date: logEntry.createdAt,
          user: logEntry.creator,
          data: changeData,
          comment: comment
        });
      }

      prodDowntime.save(this.next());
    },
    function recalcOrderDurationsStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to delete downtime [%s] (LOG=[%s]): %s',
          prodDowntimeId,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      if (this.oldProdShiftOrder)
      {
        this.oldProdShiftOrder.recalcDurations(true, this.parallel());
      }

      if (this.newProdShiftOrder)
      {
        this.newProdShiftOrder.recalcDurations(true, this.parallel());
      }
    },
    function handleRecalcDurationsResultStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to recalc order [%s/%s] durations after editing downtime [%s] (LOG=[%s]): %s',
          this.oldProdShiftOrder ? this.oldProdShiftOrder._id : '-',
          this.newProdShiftOrder ? this.newProdShiftOrder._id : '-',
          prodDowntimeId,
          logEntry._id,
          err.stack
        );
      }

      this.oldProdShiftOrder = null;
      this.newProdShiftOrder = null;
    },
    util.createRecalcShiftTimesStep(productionModule, logEntry),
    done
  );
};
