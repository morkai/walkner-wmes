// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function checkSerialNumberRoute(app, productionModule, req, res, next)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const logEntry = new ProdLogEntry(_.assign(req.body, {
    savedAt: new Date(),
    todo: false
  }));

  step(
    function()
    {
      if (logEntry._id)
      {
        return;
      }

      const lineState = productionModule.getProdLineState(logEntry.prodLine);

      if (!lineState)
      {
        return this.skip(null, {
          result: 'INVALID_LINE'
        });
      }

      const hasOrderNo = /^[0-9]+$/.test(logEntry.data.orderNo) && logEntry.data.orderNo !== '000000000';
      const prodShift = lineState.prodShift;
      const currentOrder = lineState.getCurrentOrder();
      const prodShiftOrder = hasOrderNo
        ? lineState.getLastOrderByNo(logEntry.data.orderNo)
        : currentOrder;

      if (!prodShift || !prodShiftOrder)
      {
        return this.skip(null, {
          result: 'INVALID_LINE_STATE'
        });
      }

      if (lineState.state !== 'working' && prodShiftOrder === currentOrder)
      {
        return this.skip(null, {
          result: 'INVALID_STATE:' + lineState.state
        });
      }

      logEntry._id = ProdLogEntry.generateId(logEntry.createdAt, prodShift._id);
      logEntry.division = prodShift.division;
      logEntry.subdivision = prodShift.subdivision;
      logEntry.mrpControllers = prodShift.mrpControllers;
      logEntry.prodFlow = prodShift.prodFlow;
      logEntry.workCenter = prodShift.workCenter;
      logEntry.prodShift = prodShift._id;
      logEntry.prodShiftOrder = prodShiftOrder._id;

      if (!hasOrderNo)
      {
        logEntry.data.orderNo = prodShiftOrder.orderId;
      }

      if (logEntry.data.sapTaktTime < 0)
      {
        logEntry.data.sapTaktTime = prodShiftOrder.sapTaktTime;
      }
    },
    function()
    {
      productionModule.checkSerialNumber(logEntry, this.next());
    },
    function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      res.json(result);

      if (result.result !== 'SUCCESS')
      {
        return;
      }

      logEntry.save(function(err)
      {
        if (!err)
        {
          return;
        }

        productionModule.error(
          `[checkSerialNumber] Failed to save the log entry [${logEntry._id}]: ${err.message}`
        );
      });
    }
  );
};
