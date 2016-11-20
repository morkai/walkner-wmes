// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function checkSerialNumber(app, productionModule, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdSerialNumber = mongoose.model('ProdSerialNumber');

  step(
    function()
    {
      productionModule.getProdData('order', logEntry.prodShiftOrder, this.parallel());

      ProdSerialNumber
        .findById(logEntry.data._id, {_id: 1})
        .lean()
        .exec(this.parallel());

      ProdSerialNumber
        .findOne({prodShiftOrder: logEntry.prodShiftOrder}, {scannedAt: 1})
        .sort({scannedAt: -1})
        .limit(1)
        .lean()
        .exec(this.parallel());
    },
    function(err, pso, usedSn, previousSn)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!pso)
      {
        return this.skip(null, {
          result: 'ORDER_NOT_FOUND'
        });
      }

      if (logEntry.data.orderNo !== pso.orderId)
      {
        return this.skip(null, {
          result: 'INVALID_ORDER'
        });
      }

      if (usedSn)
      {
        return this.skip(null, {
          result: 'ALREADY_USED'
        });
      }

      this.pso = pso;
      this.sn = new ProdSerialNumber(logEntry.data);
      this.sn.prodShiftOrder = logEntry.prodShiftOrder;
      this.sn.prodLine = logEntry.prodLine;

      try
      {
        const previousScannedAt = previousSn ? previousSn.scannedAt : pso.startedAt;
        const latestScannedAt = this.sn.scannedAt;
        const taktTime = latestScannedAt.getTime() - previousScannedAt.getTime();

        if (taktTime > 0)
        {
          this.sn.taktTime = taktTime;
        }
      }
      catch (err)
      {
        return this.skip(err);
      }

      this.sn.save(this.next());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      ProdSerialNumber.aggregate([
        {$match: {prodShiftOrder: this.sn.prodShiftOrder}},
        {$group: {_id: '$prodShiftOrder', quantityDone: {$sum: 1}, totalTaktTime: {$sum: '$taktTime'}}}
      ], this.parallel());
    },
    function(err, results)
    {
      if (err)
      {
        return this.skip(err);
      }

      const quantityDone = results.length ? results[0].quantityDone : 0;
      const totalTaktTime = results.length ? results[0].totalTaktTime : 0;
      const avgTaktTime = (totalTaktTime / quantityDone) || 0;

      this.result = {
        result: 'SUCCESS',
        serialNumber: this.sn.toJSON(),
        quantityDone: quantityDone,
        avgTaktTime: avgTaktTime
      };

      this.pso.quantityDone = quantityDone;
      this.pso.avgTaktTime = avgTaktTime;
      this.pso.save(this.next());
    },
    function(err)
    {
      this.skip(err, this.result);
    },
    function(err, result)
    {
      done(err, result);
    }
  );
};
