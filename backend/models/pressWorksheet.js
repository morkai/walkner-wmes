// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const autoIncrement = require('mongoose-auto-increment');
const createOrderLossSchema = require('./createOrderLossSchema');

module.exports = function setupPressWorksheetModel(app, mongoose)
{
  const TIME_RE = /^([0-9]{2}:[0-9]{2}|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z)$/;

  const pressWorksheetDowntimeSchema = new mongoose.Schema({
    prodDowntime: {
      type: String,
      ref: 'ProdDowntime',
      default: null
    },
    reason: {
      type: String,
      ref: 'DowntimeReason',
      required: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      min: 1,
      max: 8 * 60
    }
  }, {
    _id: false
  });

  const pressWorksheetOrderSchema = new mongoose.Schema({
    prodShiftOrder: {
      type: String,
      ref: 'ProdShiftOrder',
      default: null
    },
    nc12: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    operationNo: {
      type: String,
      required: true
    },
    operationName: {
      type: String,
      default: null
    },
    orderData: {},
    division: {
      type: String,
      ref: 'Division',
      required: true
    },
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    quantityDone: {
      type: Number,
      min: 0,
      default: 0
    },
    startedAt: {
      type: String,
      match: TIME_RE,
      default: null
    },
    finishedAt: {
      type: String,
      match: TIME_RE,
      default: null
    },
    losses: [createOrderLossSchema(mongoose)],
    downtimes: [pressWorksheetDowntimeSchema],
    notes: {
      type: String,
      default: '',
      trim: true
    }
  }, {
    _id: false
  });

  pressWorksheetOrderSchema.methods.getDowntimeDuration = function()
  {
    return (this.get('downtimes') || []).reduce(
      (duration, downtime) => duration + downtime.duration * 60 * 1000,
      0
    );
  };

  pressWorksheetOrderSchema.methods.calcTimes = function(
    startedAtMoment, unitDuration, lastOrder, lastOrderFinishedAt)
  {
    this.startedAt = startedAtMoment.toISOString();

    startedAtMoment.add(Math.floor(unitDuration * this.quantityDone + this.getDowntimeDuration()), 'ms');

    this.finishedAt = lastOrder ? lastOrderFinishedAt : startedAtMoment.toISOString();
  };

  const pressWorksheetSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    type: {
      type: String,
      required: true,
      enum: ['mech', 'paintShop', 'optics']
    },
    divisions: [String],
    prodLines: [String],
    startedAt: {
      type: String,
      match: TIME_RE,
      default: null
    },
    finishedAt: {
      type: String,
      match: TIME_RE,
      default: null
    },
    master: {},
    operator: {},
    operators: [{}],
    orders: [pressWorksheetOrderSchema],
    createdAt: {
      type: Date,
      required: true
    },
    creator: {},
    updatedAt: {
      type: Date,
      default: null
    },
    updater: {}
  }, {
    id: false
  });

  pressWorksheetSchema.plugin(autoIncrement.plugin, {
    model: 'PressWorksheet',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  pressWorksheetSchema.statics.TOPIC_PREFIX = 'pressWorksheets';

  pressWorksheetSchema.index({date: -1});
  pressWorksheetSchema.index({divisions: 1, date: -1});
  pressWorksheetSchema.index({type: 1, date: -1});
  pressWorksheetSchema.index({'master.id': 1, date: -1});
  pressWorksheetSchema.index({'operators.id': 1, date: -1});
  pressWorksheetSchema.index({'creator.id': 1, date: -1});

  pressWorksheetSchema.pre('save', function(next)
  {
    if (this.type === 'paintShop')
    {
      this.calcOrdersTimes();
    }

    next();
  });

  pressWorksheetSchema.methods.getTotalQuantityDone = function()
  {
    return this.get('orders').reduce(
      (total, order) => total + order.quantityDone,
      0
    );
  };

  pressWorksheetSchema.methods.getTotalDowntimeDuration = function()
  {
    return this.get('orders').reduce(
      (total, order) => total + order.getDowntimeDuration(),
      0
    );
  };

  pressWorksheetSchema.methods.calcOrdersTimes = function()
  {
    const ordersStartedAt = getDateFromTimeString(this.date, this.startedAt, false);
    const ordersFinishedAt = getDateFromTimeString(this.date, this.finishedAt, true);
    const totalDuration = ordersFinishedAt.getTime() - ordersStartedAt.getTime();
    const workDuration = totalDuration - this.getTotalDowntimeDuration();
    const unitDuration = workDuration / this.getTotalQuantityDone();
    const startedAtMoment = moment(ordersStartedAt);
    const lastIndex = this.orders.length - 1;
    const finishedAt = ordersFinishedAt.toISOString();

    _.forEach(this.orders, function(order, i)
    {
      order.calcTimes(startedAtMoment, unitDuration, i === lastIndex, finishedAt);
    });
  };

  pressWorksheetSchema.methods.createOrdersAndDowntimes = function(done)
  {
    const pressWorksheet = this;
    const operators = this.operators;
    const workerCount = Array.isArray(operators) ? operators.length : 0;
    let operator = this.operator;

    if (!operator && workerCount)
    {
      operator = operators[0];
    }

    const ProdLogEntry = mongoose.model('ProdLogEntry');
    const ProdShiftOrder = mongoose.model('ProdShiftOrder');
    const ProdDowntime = mongoose.model('ProdDowntime');
    const prodShiftOrders = [];
    const prodDowntimes = [];
    const divisions = {};
    const prodLines = {};
    let updatedIds = 0;

    _.forEach(this.orders, function(order)
    {
      const startedAt = getDateFromTimeString(pressWorksheet.date, order.startedAt, false);
      const finishedAt = getDateFromTimeString(pressWorksheet.date, order.finishedAt, true);

      if (isNaN(startedAt.getTime()) || isNaN(finishedAt.getTime()))
      {
        return;
      }

      const orderData = order.orderData;
      let operations = {};

      if (Array.isArray(orderData.operations))
      {
        _.forEach(orderData.operations, function(operation)
        {
          operations[operation.no] = operation;
        });
      }
      else if (orderData.operations)
      {
        operations = orderData.operations;
      }

      orderData.operations = operations;

      const needsId = order.prodShiftOrder === null;
      const prodShiftOrder = {
        _id: needsId
          ? ProdLogEntry.generateId(startedAt, order.prodLine + order.nc12)
          : order.prodShiftOrder,
        prodShift: null,
        pressWorksheet: pressWorksheet._id,
        date: pressWorksheet.date,
        shift: pressWorksheet.shift,
        mechOrder: true,
        orderId: order.nc12,
        operationNo: order.operationNo,
        orderData: orderData,
        workerCount: workerCount,
        quantityDone: order.quantityDone,
        losses: Array.isArray(order.losses) && order.losses.length ? order.losses : null,
        creator: pressWorksheet.creator,
        startedAt: startedAt,
        finishedAt: finishedAt,
        master: pressWorksheet.master,
        leader: null,
        operator: operator,
        operators: operators,
        notes: typeof order.notes === 'string' ? order.notes : ''
      };

      if (needsId)
      {
        updatedIds += 1;
        order.prodShiftOrder = prodShiftOrder._id;
      }

      app.orgUnits.getAllForProdLine(order.prodLine, prodShiftOrder);

      if (prodShiftOrder.prodLine === null)
      {
        return;
      }

      order.division = prodShiftOrder.division;
      order.prodLine = prodShiftOrder.prodLine;

      divisions[order.division] = true;
      prodLines[order.prodLine] = true;

      const orderDowntimes = [];
      let downtimeStartTime = startedAt.getTime();

      _.forEach(order.downtimes || [], function(downtime)
      {
        const downtimeStartedAt = new Date(downtimeStartTime);

        downtimeStartTime += downtime.duration * 60 * 1000;

        const finishedAt = new Date(downtimeStartTime);
        const needsId = downtime.prodDowntime === null;
        const prodDowntime = {
          _id: needsId
            ? ProdLogEntry.generateId(downtimeStartedAt, prodShiftOrder._id)
            : downtime.prodDowntime,
          division: prodShiftOrder.division,
          subdivision: prodShiftOrder.subdivision,
          mrpControllers: prodShiftOrder.mrpControllers,
          prodFlow: prodShiftOrder.prodFlow,
          workCenter: prodShiftOrder.workCenter,
          prodLine: prodShiftOrder.prodLine,
          prodShift: null,
          prodShiftOrder: prodShiftOrder._id,
          pressWorksheet: pressWorksheet._id,
          date: prodShiftOrder.date,
          shift: prodShiftOrder.shift,
          aor: getSubdivisionAor(prodShiftOrder.subdivision),
          reason: downtime.reason,
          reasonComment: '',
          decisionComment: '',
          status: 'confirmed',
          startedAt: downtimeStartedAt,
          finishedAt: finishedAt,
          corroborator: pressWorksheet.master,
          corroboratedAt: finishedAt,
          creator: null,
          master: pressWorksheet.master,
          leader: null,
          operator: operator,
          operators: operators,
          mechOrder: true,
          orderId: prodShiftOrder.orderId,
          operationNo: prodShiftOrder.operationNo,
          orderData: ProdDowntime.getOrderData(prodShiftOrder)
        };

        if (needsId)
        {
          updatedIds += 1;
          downtime.prodDowntime = prodDowntime._id;
        }

        orderDowntimes.push(prodDowntime);
        prodDowntimes.push(prodDowntime);
      });

      ProdShiftOrder.calcDurations(prodShiftOrder, orderDowntimes);

      prodShiftOrders.push(prodShiftOrder);
    });

    if (!prodShiftOrders.length)
    {
      return done();
    }

    ProdShiftOrder.create(prodShiftOrders, function(err)
    {
      if (err)
      {
        return done(err);
      }

      if (!prodShiftOrders.length)
      {
        return done();
      }

      ProdDowntime.create(prodDowntimes, function(err)
      {
        if (err)
        {
          return done(err);
        }

        if (updatedIds === 0)
        {
          return done();
        }

        pressWorksheet.divisions = Object.keys(divisions);
        pressWorksheet.prodLines = Object.keys(prodLines);

        pressWorksheet.markModified('orders');
        pressWorksheet.save(done);
      });
    });
  };

  function getDateFromTimeString(date, time, finish)
  {
    if (typeof time !== 'string')
    {
      return null;
    }

    if (/^[0-9]{2}:[0-9]{2}$/.test(time))
    {
      time = time.split(':').map(p => parseInt(p, 10));

      date = new Date(date);
      date.setHours(time[0]);
      date.setMinutes(time[1]);

      if (finish && time[0] === 6 && time[1] === 0)
      {
        date.setHours(5);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
      }

      return date.getHours() < 6 ? new Date(date.getTime() + 24 * 3600 * 1000) : date;
    }

    const isoMoment = moment(time);

    if (!isoMoment.isValid())
    {
      return null;
    }

    if (finish && isoMoment.hours() === 6 && isoMoment.minutes() === 0)
    {
      isoMoment.hours(5).minutes(59).seconds(59).milliseconds(999);
    }

    return isoMoment.toDate();
  }

  function getSubdivisionAor(subdivisionId)
  {
    const subdivision = app.subdivisions.modelsById[subdivisionId];

    if (!subdivision)
    {
      return null;
    }

    return subdivision.aor || null;
  }

  mongoose.model('PressWorksheet', pressWorksheetSchema);
};
