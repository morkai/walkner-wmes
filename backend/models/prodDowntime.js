// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var autoIncrement = require('mongoose-auto-increment');

module.exports = function setupProdDowntimeModel(app, mongoose)
{
  var changeSchema = mongoose.Schema({
    date: Date,
    user: {},
    data: {},
    comment: String
  }, {
    _id: false,
    minimize: false
  });

  var alertSchema = mongoose.Schema({
    _id: String,
    name: String,
    action: Number,
    active: Boolean
  }, {
    _id: false
  });

  var prodDowntimeSchema = mongoose.Schema({
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
    prodShift: {
      type: String,
      ref: 'ProdShift',
      default: null
    },
    prodShiftOrder: {
      type: String,
      ref: 'ProdShiftOrder',
      default: null
    },
    pressWorksheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PressWorksheet',
      default: null
    },
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
    aor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aor',
      default: null
    },
    reason: {
      type: String,
      ref: 'DowntimeReason',
      required: true
    },
    reasonComment: String,
    decisionComment: String,
    status: {
      type: String,
      enum: ['undecided', 'confirmed', 'rejected']
    },
    startedAt: {
      type: Date,
      required: true
    },
    finishedAt: {
      type: Date,
      default: null
    },
    corroborator: {},
    corroboratedAt: {
      type: Date,
      default: null
    },
    creator: {},
    master: {},
    leader: {},
    operator: {},
    operators: [{}],
    subdivisionType: {
      type: String,
      default: 'assembly'
    },
    mechOrder: {
      type: Boolean,
      default: null
    },
    orderId: {
      type: String,
      default: null
    },
    operationNo: {
      type: String,
      default: null
    },
    changes: [changeSchema],
    updatedAt: Date,
    changesCount: {},
    workerCount: {
      type: Number,
      default: 1
    },
    alerts: [alertSchema],
    auto: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }, {
    id: false
  });

  prodDowntimeSchema.plugin(autoIncrement.plugin, {
    model: 'ProdDowntime',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  prodDowntimeSchema.index({orderId: 1});
  prodDowntimeSchema.index({prodShiftOrder: 1});
  prodDowntimeSchema.index({prodShift: 1});
  prodDowntimeSchema.index({pressWorksheet: 1});
  prodDowntimeSchema.index({startedAt: -1});
  prodDowntimeSchema.index({finishedAt: -1});
  prodDowntimeSchema.index({status: 1, startedAt: -1});
  prodDowntimeSchema.index({reason: 1, startedAt: -1});
  prodDowntimeSchema.index({aor: 1, startedAt: -1});
  prodDowntimeSchema.index({division: 1, startedAt: -1});
  prodDowntimeSchema.index({subdivision: 1, startedAt: -1});
  prodDowntimeSchema.index({mrpController: 1, startedAt: -1});
  prodDowntimeSchema.index({prodFlow: 1, startedAt: -1});
  prodDowntimeSchema.index({workCenter: 1, startedAt: -1});
  prodDowntimeSchema.index({prodLine: 1, startedAt: -1});
  prodDowntimeSchema.index({updatedAt: 1, status: 1});
  prodDowntimeSchema.index({'alerts.active': 1});

  prodDowntimeSchema.statics.TOPIC_PREFIX = 'prodDowntimes';

  prodDowntimeSchema.pre('save', function(next)
  {
    this.updatedAt = new Date();
    this._wasNew = this.isNew;

    if (this._wasNew)
    {
      this.resetChanges();
    }
    else if (this.isModified('changes'))
    {
      this.increaseChangesCount(this.changes[this.changes.length - 1]);
    }

    this._changes = this.modifiedPaths();

    next();
  });

  prodDowntimeSchema.post('save', function(doc)
  {
    if (app.production.recreating)
    {
      return;
    }

    if (doc._wasNew)
    {
      app.broker.publish('prodDowntimes.created.' + doc.prodLine, doc.toJSON());
    }
    else if (Array.isArray(doc._changes) && doc._changes.length)
    {
      var changes = {_id: doc._id};

      _.forEach(doc._changes, function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });
      doc._changes = null;

      app.broker.publish('prodDowntimes.updated.' + doc._id, changes);
    }
  });

  prodDowntimeSchema.methods.isEditable = function()
  {
    return this.finishedAt !== null && this.pressWorksheet === null;
  };

  prodDowntimeSchema.methods.resetChanges = function()
  {
    this.changes = [{
      date: this.startedAt,
      user: this.operator || this.creator,
      data: {
        reason: [null, this.reason],
        aor: [null, this.aor]
      },
      comment: this.reasonComment
    }];
    this.changesCount = {
      rejected: 0,
      reason: 0,
      aor: 0
    };

    if (this.pressWorksheet)
    {
      this.changes.push({
        date: this.finishedAt,
        user: this.master,
        data: {
          status: ['undecided', 'confirmed']
        },
        comment: ''
      });
    }
  };

  prodDowntimeSchema.methods.increaseChangesCount = function(changes)
  {
    var changed = false;

    if (!this.changesCount)
    {
      this.changesCount = {
        rejected: 0,
        reason: 0,
        aor: 0
      };

      changed = true;
    }

    if (changes.data.status && changes.data.status[1] === 'rejected')
    {
      this.changesCount.rejected = (this.changesCount.rejected || 0) + 1;

      changed = true;
    }

    if (changes.data.reason)
    {
      this.changesCount.reason = (this.changesCount.reason || 0) + 1;

      changed = true;
    }

    if (changes.data.aor)
    {
      this.changesCount.aor = (this.changesCount.aor || 0) + 1;

      changed = true;
    }

    if (changed)
    {
      this.markModified('changesCount');
    }
  };

  mongoose.model('ProdDowntime', prodDowntimeSchema);
};
