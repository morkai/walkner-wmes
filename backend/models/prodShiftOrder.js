// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var createOrderLossSchema = require('./createOrderLossSchema');

module.exports = function setupProdShiftOrderModel(app, mongoose)
{
  var prodShiftOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    prodShift: {
      type: String,
      ref: 'ProdShift',
      default: null
    },
    pressWorksheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PressWorksheet',
      default: null
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
      trim: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    subdivisionType: {
      type: String,
      default: 'assembly'
    },
    mechOrder: {
      type: Boolean,
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    operationNo: {
      type: String,
      required: true
    },
    orderData: {},
    laborTime: {
      type: Number,
      default: 0
    },
    laborSetupTime: {
      type: Number,
      default: 0
    },
    machineTime: {
      type: Number,
      default: 0
    },
    machineSetupTime: {
      type: Number,
      default: 0
    },
    workerCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    quantityDone: {
      type: Number,
      default: 0,
      min: 0
    },
    quantityLost: {
      type: Number,
      default: 0,
      min: 0
    },
    losses: {
      type: [createOrderLossSchema(mongoose)],
      default: null
    },
    creator: {},
    startedAt: {
      type: Date,
      required: true
    },
    finishedAt: {
      type: Date,
      default: null
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    workDuration: {
      type: Number,
      default: 0
    },
    downtimeDuration: {
      type: Number,
      default: 0
    },
    breakDuration: {
      type: Number,
      default: 0
    },
    master: {},
    leader: {},
    operator: {},
    operators: [{}],
    notes: {
      type: String,
      default: ''
    },
    spigot: {}
  }, {
    id: false
  });

  prodShiftOrderSchema.statics.TOPIC_PREFIX = 'prodShiftOrders';

  prodShiftOrderSchema.index({prodShift: 1});
  prodShiftOrderSchema.index({pressWorksheet: 1});
  prodShiftOrderSchema.index({orderId: 1});
  prodShiftOrderSchema.index({startedAt: -1});
  prodShiftOrderSchema.index({division: 1, startedAt: -1});
  prodShiftOrderSchema.index({subdivision: 1, startedAt: -1});
  prodShiftOrderSchema.index({mrpController: 1, startedAt: -1});
  prodShiftOrderSchema.index({prodFlow: 1, startedAt: -1});
  prodShiftOrderSchema.index({workCenter: 1, startedAt: -1});
  prodShiftOrderSchema.index({prodLine: 1, startedAt: -1});

  prodShiftOrderSchema.pre('save', function(next)
  {
    this._wasNew = this.isNew;

    if (this.isModified('quantityDone') || this.isModified('losses'))
    {
      this.recountTotals();
    }

    this._changes = this.modifiedPaths();

    this.copyOperationData();

    next();
  });

  prodShiftOrderSchema.post('save', function(doc)
  {
    if (app.production.recreating)
    {
      return;
    }

    if (doc._wasNew)
    {
      app.broker.publish('prodShiftOrders.created.' + doc.prodLine, doc.toJSON());
    }
    else if (Array.isArray(doc._changes) && doc._changes.length)
    {
      var changes = {_id: doc._id};

      _.forEach(doc._changes, function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });
      doc._changes = null;

      app.broker.publish('prodShiftOrders.updated.' + doc._id, changes);
    }
  });

  prodShiftOrderSchema.statics.calcDurations = function(prodShiftOrder, prodDowntimes)
  {
    prodShiftOrder.totalDuration = (prodShiftOrder.finishedAt - prodShiftOrder.startedAt) / 3600000;
    prodShiftOrder.breakDuration = 0;
    prodShiftOrder.downtimeDuration = 0;

    _.forEach(prodDowntimes, function(prodDowntime)
    {
      var reason = app.downtimeReasons.modelsById[prodDowntime.reason];
      var property = reason && reason.type === 'break' ? 'breakDuration' : 'downtimeDuration';

      prodShiftOrder[property] += (prodDowntime.finishedAt - prodDowntime.startedAt) / 3600000;
    });

    prodShiftOrder.workDuration = prodShiftOrder.totalDuration - prodShiftOrder.breakDuration;
  };

  prodShiftOrderSchema.methods.isEditable = function()
  {
    return this.finishedAt !== null && this.pressWorksheet === null;
  };

  prodShiftOrderSchema.methods.copyOperationData = function()
  {
    if (!this.operationNo || !this.orderData)
    {
      return;
    }

    var operations = this.orderData.operations;

    if (!operations)
    {
      return;
    }

    var operation = operations[this.operationNo];

    this.laborTime = 0;
    this.laborSetupTime = 0;
    this.machineTime = 0;
    this.machineSetupTime = 0;

    if (!operation)
    {
      return;
    }

    if (!app.orders || !app.orders.getGroupedOperations)
    {
      this.laborTime = operation.laborTime > 0 ? operation.laborTime : 0;
      this.laborSetupTime = operation.laborSetupTime > 0 ? operation.laborSetupTime : 0;
      this.machineTime = operation.machineTime > 0 ? operation.machineTime : 0;
      this.machineSetupTime = operation.machineSetupTime > 0 ? operation.machineSetupTime : 0;

      return;
    }

    app.orders.getGroupedOperations(operations, this.operationNo).forEach(function(operation)
    {
      this.laborTime += operation.laborTime > 0 ? operation.laborTime : 0;
      this.laborSetupTime += operation.laborSetupTime > 0 ? operation.laborSetupTime : 0;
      this.machineTime += operation.machineTime > 0 ? operation.machineTime : 0;
      this.machineSetupTime += operation.machineSetupTime > 0 ? operation.machineSetupTime : 0;
    }, this);
  };

  prodShiftOrderSchema.methods.recountTotals = function()
  {
    if (Array.isArray(this.losses) && this.losses.length === 1 && this.losses[0] === null)
    {
      this.losses = null;
    }

    this.quantityLost = !Array.isArray(this.losses)
      ? 0
      : this.losses.reduce(function(sum, loss)
        {
          return sum + (loss && typeof loss.count === 'number' ? loss.count : 0);
        }, 0);
    this.totalQuantity = this.quantityDone + this.quantityLost;
  };

  prodShiftOrderSchema.methods.recalcDurations = function(save, done)
  {
    this.totalDuration = 0;
    this.workDuration = 0;
    this.downtimeDuration = 0;
    this.breakDuration = 0;

    if (!this.finishedAt)
    {
      return save ? this.save(done) : done();
    }

    var conditions = {
      prodShiftOrder: this._id,
      finishedAt: {$ne: null}
    };
    var fields = {
      reason: 1,
      startedAt: 1,
      finishedAt: 1
    };
    var prodShiftOrder = this;

    mongoose.model('ProdDowntime').find(conditions, fields).lean().exec(function(err, prodDowntimes)
    {
      if (err)
      {
        return done(err);
      }

      prodShiftOrder.constructor.calcDurations(prodShiftOrder, prodDowntimes);

      if (save)
      {
        prodShiftOrder.save(done);
      }
      else
      {
        done();
      }
    });
  };

  mongoose.model('ProdShiftOrder', prodShiftOrderSchema);
};
