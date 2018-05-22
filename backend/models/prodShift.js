// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function setupProdShiftModel(app, mongoose)
{
  const quantitySchema = new mongoose.Schema({
    planned: {
      type: Number,
      default: 0,
      min: 0
    },
    actual: {
      type: Number,
      default: 0,
      min: 0
    }
  }, {
    _id: false
  });

  const prodShiftSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    division: {
      type: String,
      ref: 'Division',
      default: null
    },
    subdivision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subdivision',
      default: null
    },
    mrpControllers: [{
      type: 'String',
      ref: 'MrpController'
    }],
    prodFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProdFlow',
      default: null
    },
    workCenter: {
      type: String,
      ref: 'WorkCenter',
      default: null
    },
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    quantitiesDone: [quantitySchema],
    creator: {},
    createdAt: {
      type: Date,
      required: true
    },
    master: {},
    leader: {},
    operator: {},
    operators: [{}],
    idle: {
      type: Number,
      default: -1
    },
    working: {
      type: Number,
      default: -1
    },
    downtime: {
      type: Number,
      default: -1
    },
    startup: {
      type: Number,
      default: -1
    },
    shutdown: {
      type: Number,
      default: -1
    },
    nextOrder: {},
    efficiency: {
      type: Number,
      default: 0
    },
    orderMrp: [String]
  }, {
    id: false
  });

  prodShiftSchema.statics.TOPIC_PREFIX = 'prodShifts';

  prodShiftSchema.statics.HOUR_TO_INDEX = [
    2, 3, 4, 5, 6, 7, 0, 1,
    2, 3, 4, 5, 6, 7, 0, 1,
    2, 3, 4, 5, 6, 7, 0, 1
  ];

  prodShiftSchema.statics.NO_TO_START_HOUR = {
    1: 6,
    2: 14,
    3: 22
  };

  prodShiftSchema.index({date: -1});
  prodShiftSchema.index({division: 1, date: -1});
  prodShiftSchema.index({subdivision: 1, date: -1});
  prodShiftSchema.index({mrpControllers: 1, date: -1});
  prodShiftSchema.index({prodFlow: 1, date: -1});
  prodShiftSchema.index({workCenter: 1, date: -1});
  prodShiftSchema.index({prodLine: 1, date: -1});
  prodShiftSchema.index({shutdown: 1, prodLine: 1});
  prodShiftSchema.index({shutdown: 1, date: -1});
  prodShiftSchema.index({orderMrp: 1, date: -1});

  prodShiftSchema.pre('save', function(next)
  {
    this._wasNew = this.isNew;
    this._changes = this.modifiedPaths();

    next();
  });

  prodShiftSchema.post('save', function(doc)
  {
    if (app.production.recreating)
    {
      return;
    }

    if (doc._wasNew)
    {
      app.broker.publish(`prodShifts.created.${doc.prodLine}`, doc.toJSON());
    }
    else if (Array.isArray(doc._changes) && doc._changes.length)
    {
      const changes = {_id: doc._id};

      doc._changes.forEach(modifiedPath =>
      {
        if (!modifiedPath.includes('.'))
        {
          changes[modifiedPath] = doc.get(modifiedPath);
        }
      });
      doc._changes = null;

      app.broker.publish(`prodShifts.updated.${doc._id}`, changes);
    }
  });

  prodShiftSchema.statics.setPlannedQuantities = function(prodLineIds, date, plannedQuantities, done)
  {
    const ProdShift = this;

    ProdShift
      .find({date: date, prodLine: {$in: prodLineIds}})
      .sort({createdAt: 1})
      .exec(function(err, prodShifts)
      {
        if (err)
        {
          return done(err);
        }

        if (prodLineIds.length !== prodShifts.length)
        {
          return done(new Error(
            `${prodShifts.length} prod shifts (${date}) were found for ${prodLineIds.length} prod lines: `
            + prodLineIds.join(', ')
          ));
        }

        const cachedProdShifts = [];

        app.production.swapToCachedProdData(prodShifts, cachedProdShifts);

        const prodLineCount = prodLineIds.length;
        const dividedQuantities = prodLineIds.map(function() { return [0, 0, 0, 0, 0, 0, 0, 0]; });

        _.forEach(plannedQuantities, function(plannedQuantity, hour)
        {
          const quantityForProdLine = Math.floor(plannedQuantity / prodLineCount);

          _.forEach(dividedQuantities, function(quantitiesForProdLine)
          {
            quantitiesForProdLine[hour] = quantityForProdLine;
          });

          for (let i = 0, l = plannedQuantity % prodLineCount; i < l; ++i)
          {
            dividedQuantities[hour % 2 ? (prodLineCount - 1 - i) : i][hour] += 1;
          }
        });

        step(
          function()
          {
            for (let i = 0; i < cachedProdShifts.length; ++i)
            {
              const prodShift = cachedProdShifts[i];
              const quantitiesDone = prodShift.quantitiesDone;

              for (let h = 0; h < 8; ++h)
              {
                quantitiesDone[h].planned = dividedQuantities[i][h];
              }

              prodShift.markModified('quantitiesDone');
              prodShift.save(this.parallel());
            }
          },
          function(err)
          {
            if (err)
            {
              return done(err);
            }

            return done(null, cachedProdShifts);
          }
        );
      });
  };

  prodShiftSchema.methods.hasEnded = function()
  {
    const prodShiftTime = this.date.getTime();
    const currentShiftTime = app.fte.getCurrentShift().date.getTime();

    return prodShiftTime < currentShiftTime;
  };

  prodShiftSchema.methods.isEditable = function()
  {
    return this.hasEnded();
  };

  prodShiftSchema.methods.recalcOrderData = function(orders)
  {
    let orderMrp = {};
    let effNum = 0;
    let effDen = 0;

    orders.forEach(order =>
    {
      if (order.orderData && order.orderData.mrp)
      {
        orderMrp[order.orderData.mrp] = true;
      }

      if (order.laborTime && order.workDuration && order.workerCount)
      {
        effNum += order.laborTime / 100 * order.totalQuantity;
        effDen += order.workDuration * order.workerCount;
      }
    });

    orderMrp = Object.keys(orderMrp);

    this.efficiency = effDen ? (effNum / effDen) : 0;
    this.orderMrp = orderMrp.length ? orderMrp : null;
  };

  prodShiftSchema.methods.recalcTimes = function(done)
  {
    const shift = this;

    step(
      function findOrdersAndDowntimesStep()
      {
        app.production.getProdShiftOrders(shift._id, this.parallel());
        app.production.getProdDowntimes(shift._id, this.parallel());
      },
      function recalcTimesStep(err, orders, downtimes)
      {
        if (err)
        {
          return this.skip(err);
        }

        const shiftStartTime = shift.date.getTime();
        const shiftEndTime = moment(shiftStartTime).add(8, 'hours').valueOf();
        const lastOrder = orders.length ? orders[orders.length - 1] : null;
        const lastDowntime = downtimes.length ? downtimes[downtimes.length - 1] : null;
        let shiftStartedAt = Math.min(
          orders.length ? orders[0].startedAt.getTime() : Number.MAX_VALUE,
          downtimes.length ? downtimes[0].startedAt.getTime() : Number.MAX_VALUE
        );
        let shiftFinishedAt = Math.max(
          lastOrder && lastOrder.finishedAt ? lastOrder.finishedAt.getTime() : Number.MIN_VALUE,
          lastDowntime && lastDowntime.finishedAt ? lastDowntime.finishedAt.getTime() : Number.MIN_VALUE
        );

        if (shiftStartedAt === Number.MAX_VALUE)
        {
          shiftStartedAt = shiftStartTime;
        }

        if (shiftFinishedAt === Number.MIN_VALUE)
        {
          shiftFinishedAt = shiftEndTime;
        }

        shift.startup = Math.max(0, shiftStartedAt - shiftStartTime);
        shift.shutdown = Math.max(0, shiftEndTime - shiftFinishedAt);

        let working = 0;
        let downtime = 0;

        for (let o = 0; o < orders.length; ++o)
        {
          const order = orders[o];

          if (order.finishedAt)
          {
            working += order.finishedAt.getTime() - order.startedAt.getTime();
          }
        }

        for (let d = 0; d < downtimes.length; ++d)
        {
          const dt = downtimes[d];

          if (dt.finishedAt)
          {
            const duration = dt.finishedAt.getTime() - dt.startedAt.getTime();

            working -= duration;
            downtime += duration;
          }
        }

        shift.idle = shiftEndTime - shiftStartTime - working - downtime;
        shift.working = working;
        shift.downtime = downtime;

        shift.recalcOrderData(orders);

        shift.save(this.next());
      },
      done
    );
  };

  prodShiftSchema.methods.getNextOrders = function()
  {
    const nextOrders = this.nextOrder;

    if (_.isEmpty(nextOrders))
    {
      return [];
    }

    if (_.isString(nextOrders.orderNo))
    {
      return [{
        orderNo: nextOrders.orderNo,
        operationNo: nextOrders.operationNo
      }];
    }

    if (_.isArray(nextOrders))
    {
      return nextOrders;
    }

    return [];
  };

  mongoose.model('ProdShift', prodShiftSchema);
};
