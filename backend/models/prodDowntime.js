// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var autoIncrement = require('mongoose-auto-increment');

module.exports = function setupProdDowntimeModel(app, mongoose)
{
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
      ref: 'ProdShift',
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

  prodDowntimeSchema.index({prodShiftOrder: 1});
  prodDowntimeSchema.index({prodShift: 1});
  prodDowntimeSchema.index({status: 1, startedAt: -1});
  prodDowntimeSchema.index({reason: 1, startedAt: -1});
  prodDowntimeSchema.index({aor: 1, startedAt: -1});
  prodDowntimeSchema.index({division: 1, startedAt: -1});
  prodDowntimeSchema.index({subdivision: 1, startedAt: -1});
  prodDowntimeSchema.index({mrpController: 1, startedAt: -1});
  prodDowntimeSchema.index({prodFlow: 1, startedAt: -1});
  prodDowntimeSchema.index({workCenter: 1, startedAt: -1});
  prodDowntimeSchema.index({startedAt: -1, prodLine: 1});

  prodDowntimeSchema.statics.TOPIC_PREFIX = 'prodDowntimes';

  prodDowntimeSchema.pre('save', function(next)
  {
    this.wasNew = this.isNew;
    this.modified = this.modifiedPaths();

    next();
  });

  prodDowntimeSchema.post('save', function(doc)
  {
    if (app.production.recreating)
    {
      return;
    }

    if (this.wasNew)
    {
      app.broker.publish('prodDowntimes.created.' + doc.prodLine, doc.toJSON());
    }
    else
    {
      var changes = {_id: doc._id};

      this.modified.forEach(function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });
      this.modified = null;

      app.broker.publish('prodDowntimes.updated.' + doc._id, changes);
    }
  });

  prodDowntimeSchema.methods.isEditable = function()
  {
    return this.finishedAt !== null && this.pressWorksheet === null;
  };

  mongoose.model('ProdDowntime', prodDowntimeSchema);
};
