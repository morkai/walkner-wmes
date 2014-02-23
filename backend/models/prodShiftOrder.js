'use strict';

module.exports = function setupProdShiftOrderModel(app, mongoose)
{
  var prodShiftOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    prodShift: {
      type: String,
      ref: 'ProdShift',
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
      default: 0,
      min: 0
    },
    workerCount: {
      type: Number,
      default: 0,
      min: 0
    },
    quantityDone: {
      type: Number,
      default: 0,
      min: 0
    },
    losses: {
      type: {},
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
      default: 0,
      min: 0
    },
    workDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    downtimeDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    breakDuration: {
      type: Number,
      default: 0,
      min: 0
    }
  }, {
    id: false
  });

  prodShiftOrderSchema.statics.TOPIC_PREFIX = 'prodShiftOrders';

  prodShiftOrderSchema.pre('save', function(next)
  {
    this.wasNew = this.isNew;
    this.modified = this.modifiedPaths();

    next();
  });

  prodShiftOrderSchema.post('save', function(doc)
  {
    if (this.wasNew)
    {
      app.broker.publish('prodShiftOrders.created.' + doc.prodLine, doc.toJSON());
    }
    else
    {
      var changes = {};

      this.modified.forEach(function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });

      app.broker.publish('prodShiftOrders.updated.' + doc._id, changes);
    }
  });

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

      prodShiftOrder.totalDuration =
        (prodShiftOrder.finishedAt - prodShiftOrder.startedAt) / 3600000;

      prodDowntimes.forEach(function(prodDowntime)
      {
        var reason = app.downtimeReasons.modelsById[prodDowntime.reason];
        var property = reason && !reason.report1 ? 'breakDuration' : 'downtimeDuration';

        prodShiftOrder[property] += (prodDowntime.finishedAt - prodDowntime.startedAt) / 3600000;
      });

      prodShiftOrder.workDuration = prodShiftOrder.totalDuration - prodShiftOrder.breakDuration;

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
