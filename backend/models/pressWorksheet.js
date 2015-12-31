// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var autoIncrement = require('mongoose-auto-increment');
var createOrderLossSchema = require('./createOrderLossSchema');

module.exports = function setupPressWorksheetModel(app, mongoose)
{
  var TIME_RE =
    /^([0-9]{2}:[0-9]{2}|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z)$/;

  var pressWorksheetDowntimeSchema = mongoose.Schema({
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

  var pressWorksheetOrderSchema = mongoose.Schema({
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
      function(duration, downtime) { return duration + downtime.duration * 60 * 1000; },
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

  var pressWorksheetSchema = mongoose.Schema({
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
      function(total, order) { return total + order.quantityDone; },
      0
    );
  };

  pressWorksheetSchema.methods.getTotalDowntimeDuration = function()
  {
    return this.get('orders').reduce(
      function(total, order) { return total + order.getDowntimeDuration(); },
      0
    );
  };

  pressWorksheetSchema.methods.calcOrdersTimes = function()
  {
    var ordersStartedAt = getDateFromTimeString(this.date, this.startedAt, false);
    var ordersFinishedAt = getDateFromTimeString(this.date, this.finishedAt, true);
    var totalDuration = ordersFinishedAt.getTime() - ordersStartedAt.getTime();
    var workDuration = totalDuration - this.getTotalDowntimeDuration();
    var unitDuration = workDuration / this.getTotalQuantityDone();
    var startedAtMoment = moment(ordersStartedAt);

    var lastIndex = this.orders.length - 1;
    var finishedAt = ordersFinishedAt.toISOString();

    _.forEach(this.orders, function(order, i)
    {
      order.calcTimes(startedAtMoment, unitDuration, i === lastIndex, finishedAt);
    });
  };

  pressWorksheetSchema.methods.createOrdersAndDowntimes = function(done)
  {
    var pressWorksheet = this;
    var operators = this.operators;
    var workerCount = Array.isArray(operators) ? operators.length : 0;
    var operator = this.operator;

    if (!operator && workerCount)
    {
      operator = operators[0];
    }

    var ProdLogEntry = mongoose.model('ProdLogEntry');
    var ProdShiftOrder = mongoose.model('ProdShiftOrder');
    var ProdDowntime = mongoose.model('ProdDowntime');
    var prodShiftOrders = [];
    var prodDowntimes = [];
    var updatedIds = 0;
    var divisions = {};
    var prodLines = {};

    _.forEach(this.orders, function(order)
    {
      var startedAt = getDateFromTimeString(pressWorksheet.date, order.startedAt, false);
      var finishedAt = getDateFromTimeString(pressWorksheet.date, order.finishedAt, true);

      if (isNaN(startedAt.getTime()) || isNaN(finishedAt.getTime()))
      {
        return;
      }

      var orderData = order.orderData;
      var operations = {};

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

      var needsId = order.prodShiftOrder === null;
      var prodShiftOrder = {
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

      var downtimeStartTime = startedAt.getTime();
      var orderDowntimes = [];

      _.forEach(order.downtimes || [], function(downtime)
      {
        var startedAt = new Date(downtimeStartTime);

        downtimeStartTime = downtimeStartTime + downtime.duration * 60 * 1000;

        var finishedAt = new Date(downtimeStartTime);
        var needsId = downtime.prodDowntime === null;
        var prodDowntime = {
          _id: needsId
            ? ProdLogEntry.generateId(startedAt, prodShiftOrder._id)
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
          startedAt: startedAt,
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
          operationNo: prodShiftOrder.operationNo
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
      time = time.split(':').map(Number);

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

    var isoMoment = moment(time);

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
    var subdivision = app.subdivisions.modelsById[subdivisionId];

    if (!subdivision)
    {
      return null;
    }

    return subdivision.aor || null;
  }

  mongoose.model('PressWorksheet', pressWorksheetSchema);
};
