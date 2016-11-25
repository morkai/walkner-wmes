// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');

module.exports = function checkSerialNumber(app, productionModule, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const mysql = app[productionModule.config.mysqlId];
  const ProdShift = mongoose.model('ProdShift');
  const ProdSerialNumber = mongoose.model('ProdSerialNumber');

  step(
    function()
    {
      productionModule.getProdData('shift', logEntry.prodShift, this.parallel());

      productionModule.getProdData('order', logEntry.prodShiftOrder, this.parallel());

      ProdSerialNumber
        .findById(logEntry.data._id)
        .lean()
        .exec(this.parallel());

      ProdSerialNumber
        .findOne({prodShiftOrder: logEntry.prodShiftOrder}, {scannedAt: 1, iptAt: 1})
        .sort({scannedAt: -1})
        .limit(1)
        .lean()
        .exec(this.parallel());
    },
    function(err, shift, pso, usedSn, previousSn)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!shift)
      {
        return this.skip(null, {
          result: 'SHIFT_NOT_FOUND'
        });
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
          result: 'ALREADY_USED',
          serialNumber: usedSn
        });
      }

      this.previousSn = previousSn;
      this.shift = shift;
      this.pso = pso;

      this.sn = new ProdSerialNumber(logEntry.data);
      this.sn.taktTime = 0;
      this.sn.prodShiftOrder = logEntry.prodShiftOrder;
      this.sn.prodLine = logEntry.prodLine;

      try
      {
        const previousScannedAt = previousSn ? previousSn.scannedAt : pso.startedAt;
        const latestScannedAt = this.sn.scannedAt;
        const taktTime = latestScannedAt.getTime() - previousScannedAt.getTime();

        if (taktTime)
        {
          this.sn.taktTime = taktTime;
        }
      }
      catch (err)
      {
        return this.skip(err);
      }

      findIptSn(this.sn._id, this.next());
    },
    function(err, iptSn)
    {
      if (err)
      {
        productionModule.error(`[checkSerialNumber] Failed to find IPT SN [${this.sn._id}]: ${err.message}`);
      }

      if (iptSn)
      {
        this.sn.iptAt = iptSn.timestamp;

        const previousIptAt = this.previousSn ? this.previousSn.iptAt : this.pso.startedAt;
        const latestIptAt = this.sn.iptAt;
        const iptTaktTime = previousIptAt ? (latestIptAt.getTime() - previousIptAt.getTime()) : 0;

        if (iptTaktTime)
        {
          this.sn.iptTaktTime = iptTaktTime;
        }
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
        {$match: {
          prodShiftOrder: this.sn.prodShiftOrder
        }},
        {$group: {
          _id: '$prodShiftOrder',
          quantityDone: {$sum: 1},
          totalTaktTime: {$sum: '$taktTime'}
        }}
      ], this.parallel());

      const scannedAt = moment(this.sn.scannedAt.getTime());
      const $gte = new Date(scannedAt.startOf('hour').valueOf());
      const $lt = scannedAt.add(1, 'hour').toDate();

      this.hourlyQuantityIndex = ProdShift.HOUR_TO_INDEX[$gte.getHours()];

      ProdSerialNumber.aggregate([
        {$match: {
          prodLine: this.sn.prodLine,
          scannedAt: {
            $gte: $gte,
            $lt: $lt
          }
        }},
        {$group: {
          _id: null,
          quantityDone: {$sum: 1}
        }}
      ], this.parallel());
    },
    function(err, orderResults, shiftResults)
    {
      if (err)
      {
        return this.skip(err);
      }

      const quantityDone = orderResults.length ? orderResults[0].quantityDone : 0;
      const totalTaktTime = orderResults.length ? orderResults[0].totalTaktTime : 0;
      const avgTaktTime = Math.round((totalTaktTime / quantityDone) || 0);
      const hourlyQuantityDone = shiftResults.length ? shiftResults[0].quantityDone : 0;

      this.result = {
        result: 'SUCCESS',
        serialNumber: this.sn.toJSON(),
        quantityDone: quantityDone,
        lastTaktTime: this.sn.taktTime,
        avgTaktTime: avgTaktTime,
        hourlyQuantityDone: {
          index: this.hourlyQuantityIndex,
          value: hourlyQuantityDone
        }
      };

      this.shift.quantitiesDone[this.hourlyQuantityIndex].actual = hourlyQuantityDone;
      this.shift.save(this.group());

      this.pso.quantityDone = quantityDone;
      this.pso.lastTaktTime = this.sn.taktTime;
      this.pso.avgTaktTime = avgTaktTime;
      this.pso.save(this.group());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const currentShiftId = productionModule.getProdLineState(this.sn.prodLine).getCurrentShiftId();

      if (logEntry.prodShift === currentShiftId)
      {
        app.broker.publish('production.synced.' + this.sn.prodLine, {
          prodLine: this.sn.prodLine,
          types: ['changeQuantityDone', 'changeQuantitiesDone'],
          prodShift: {
            quantitiesDone: this.shift.quantitiesDone
          },
          prodShiftOrder: {
            _id: this.pso._id,
            quantityDone: this.pso.quantityDone,
            lastTaktTime: this.pso.lastTaktTime,
            avgTaktTime: this.pso.avgTaktTime
          }
        });
      }

      setImmediate(this.next(), null, this.result);
    },
    done
  );

  function findIptSn(serialNumber, done)
  {
    if (!mysql)
    {
      return done();
    }

    step(
      function()
      {
        mysql.pool.getConnection(this.next());
      },
      function(err, conn)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.conn = conn;

        conn.query('SELECT * FROM serialnumber WHERE serialnumber=? LIMIT 1', [serialNumber], this.next());
      },
      function(err, results)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (results && results.length)
        {
          return this.skip(null, results[0]);
        }
      },
      function(err, result)
      {
        if (this.conn)
        {
          this.conn.release();
          this.conn = null;
        }

        done(err, result);
      }
    );
  }
};
