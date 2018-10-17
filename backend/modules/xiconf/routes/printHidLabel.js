// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');

const LOCKS = new Map();

module.exports = function printHidLabelRoute(app, module, req, res, next)
{
  const html2pdf = app[module.config.html2pdfId];
  const mongoose = app[module.config.mongooseId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const Printer = mongoose.model('Printer');
  const Counter = mongoose.model('Counter');

  let {requestId, orderNo, serialNo, line} = req.body; // eslint-disable-line prefer-const

  if (LOCKS.has(requestId))
  {
    return res.json(LOCKS.get(requestId));
  }

  step(
    function()
    {
      if (orderNo)
      {
        return;
      }

      ProdShiftOrder
        .findOne({prodLine: line}, {orderId: 1})
        .sort({startedAt: -1})
        .lean()
        .exec(this.next());
    },
    function(err, pso)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (orderNo)
      {
        return;
      }

      if (!pso)
      {
        return this.skip(app.createError(`No order found for line: ${line}`, 'INPUT', 400));
      }

      orderNo = pso.orderId;
    },
    function()
    {
      this.release = lock(orderNo, this.next());
    },
    function()
    {
      fs.readFile(`${__dirname}/hidLamp.prn`, 'utf8', this.parallel());

      Printer
        .findOne({tags: 'hidLamps', special: new RegExp(_.escapeRegExp(line), 'i')})
        .lean()
        .exec(this.parallel());

      if (!serialNo)
      {
        Counter.collection.findOneAndUpdate(
          {_id: {type: 'hidLamps', orderNo}},
          {$inc: {c: 1}, $set: {ts: new Date()}},
          {upsert: true, returnOriginal: false},
          this.parallel()
        );
      }
    },
    function(err, zpl, printer, res)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (res && res.value)
      {
        serialNo = res.value.c;
      }

      serialNo = String(serialNo).replace(/[^0-9]+/g, '') || '0';

      const serviceTag = `PL04.${orderNo}.${serialNo.padStart(4, '0')}`;
      const templateData = {
        DLE: '\u0010',
        ORDER_NO: orderNo,
        SERIAL_NO: serialNo,
        SERVICE_TAG: serviceTag
      };

      Object.keys(templateData).forEach(key =>
      {
        zpl = zpl.replace(new RegExp('\\$\\{' + key + '\\}', 'g'), templateData[key]);
      });

      html2pdf.printZpl(zpl, {printer, line}, this.next());
    },
    function(err)
    {
      if (err)
      {
        next(err);
      }
      else
      {
        const result = {line, orderNo, serialNo};

        LOCKS.set(requestId, result);

        setTimeout(() => LOCKS.delete(requestId), 30000);

        res.json(result);
      }

      this.release();
    }
  );

  function lock(orderNo, callback)
  {
    if (LOCKS.has(orderNo))
    {
      LOCKS.get(orderNo).push(callback);
    }
    else
    {
      LOCKS.set(orderNo, []);

      setImmediate(callback);
    }

    return () =>
    {
      const locks = LOCKS.get(orderNo);

      if (locks.length)
      {
        locks.shift()();
      }
      else
      {
        LOCKS.delete(orderNo);
      }
    };
  }
};
