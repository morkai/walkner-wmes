// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');

const ORDER_LOCKS = {};

module.exports = function checkSerialNumber(app, productionModule, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const mysql = app[productionModule.config.mysqlId];
  const Order = mongoose.model('Order');
  const ProdShift = mongoose.model('ProdShift');
  const ProdDowntime = mongoose.model('ProdDowntime');
  const ProdSerialNumber = mongoose.model('ProdSerialNumber');

  step(
    function()
    {
      if (/^[A-Z0-9]+\.0+\.0+$/.test(logEntry.data._id))
      {
        this.virtual = true;
        this.releaseLock = handleVirtualSn(logEntry, this.next());
      }
    },
    function(err, result)
    {
      if (err || result)
      {
        return this.skip(err, result);
      }

      productionModule.getProdData('shift', logEntry.prodShift, this.parallel());

      productionModule.getProdData('order', logEntry.prodShiftOrder, this.parallel());

      ProdDowntime
        .find({
          prodShiftOrder: logEntry.prodShiftOrder,
          reason: {$in: productionModule.settings['taktTime.ignoredDowntimes'] || []}
        }, {
          _id: 0,
          startedAt: 1,
          finishedAt: 1
        })
        .sort({startedAt: 1})
        .lean()
        .exec(this.parallel());

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
    function(err, shift, pso, downtimes, usedSn, previousSn)
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

      const previousScannedAt = (previousSn ? previousSn.scannedAt : pso.startedAt).getTime();
      const latestScannedAt = this.sn.scannedAt.getTime();
      let ignoredDuration = 0;

      downtimes.forEach(function(d)
      {
        if (d.startedAt >= previousScannedAt && d.finishedAt <= latestScannedAt)
        {
          ignoredDuration += d.finishedAt - d.startedAt;
        }
      });

      this.ignoredDuration = ignoredDuration;
      this.sn.taktTime = latestScannedAt - previousScannedAt - ignoredDuration;

      if (!this.virtual)
      {
        findIptSn(this.sn._id, this.next());
      }
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
          this.sn.iptTaktTime = iptTaktTime - this.ignoredDuration;
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
        },
        totalQuantityDone: null
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

      Order.recountQtyDone(this.pso.orderId, this.next());
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
    function(err, result)
    {
      done(err, result);

      if (this.releaseLock)
      {
        this.releaseLock();
        this.releaseLock = null;
      }
    }
  );

  function handleVirtualSn(logEntry, done)
  {
    const orderNo = logEntry.data.orderNo;

    if (ORDER_LOCKS[orderNo])
    {
      ORDER_LOCKS[orderNo].push(logEntry, done);

      return releaseLock.bind(null, orderNo);
    }

    ORDER_LOCKS[orderNo] = [];

    replaceVirtualSn(logEntry, done);

    return releaseLock.bind(null, orderNo);
  }

  function releaseLock(orderNo)
  {
    const lock = ORDER_LOCKS[orderNo];

    if (!lock)
    {
      return;
    }

    const logEntry = lock.shift();
    const done = lock.shift();

    if (!lock.length)
    {
      delete ORDER_LOCKS[orderNo];
    }

    if (logEntry)
    {
      replaceVirtualSn(logEntry, done);
    }
  }

  function replaceVirtualSn(logEntry, done)
  {
    step(
      function()
      {
        ProdSerialNumber
          .findOne({orderNo: logEntry.data.orderNo}, {serialNo: 1})
          .sort({scannedAt: -1})
          .lean()
          .exec(this.next());
      },
      function(err, prodSerialNumber)
      {
        if (err)
        {
          return this.skip(err);
        }

        logEntry.data.serialNo = prodSerialNumber ? (prodSerialNumber.serialNo + 1) : 1;

        const snParts = logEntry.data._id.split('.');

        logEntry.data._id = snParts[0]
          + '.' + logEntry.data.orderNo
          + '.' + '0'.repeat(4 - logEntry.data.serialNo.toString().length) + logEntry.data.serialNo;
      },
      function()
      {
        if (logEntry.data.serialNo === 1)
        {
          findIptOperation(logEntry.data.orderNo, this.next());
        }
      },
      function(err, hasOperation)
      {
        if (err)
        {
          return done(err);
        }

        if (hasOperation)
        {
          return done(null, {
            result: 'STANDARD_LABEL'
          });
        }

        return done();
      }
    );
  }

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

  function findIptOperation(orderNo, done)
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

        const sql = `SELECT 1 FROM operation
WHERE production_order_id=(SELECT id FROM productionorder WHERE order_id=?)
AND operation='PrintStandardLabel'
AND disabledTimestamp IS NULL
LIMIT 1`;

        conn.query(sql, [orderNo], this.next());
      },
      function(err, results)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (results && results.length)
        {
          return this.skip(null, true);
        }
      },
      function(err, result)
      {
        if (this.conn)
        {
          this.conn.release();
          this.conn = null;
        }

        done(err, !!result);
      }
    );
  }
};
