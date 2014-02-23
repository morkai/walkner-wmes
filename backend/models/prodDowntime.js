'use strict';

module.exports = function setupProdDowntimeModel(app, mongoose)
{
  var prodDowntimeSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
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

  prodDowntimeSchema.index({prodShiftOrder: 1});
  prodDowntimeSchema.index({status: 1, startedAt: -1});
  prodDowntimeSchema.index({reason: 1, startedAt: -1});
  prodDowntimeSchema.index({aor: 1, startedAt: -1});
  prodDowntimeSchema.index({orderId: 1});
  prodDowntimeSchema.index({division: 1, startedAt: -1});
  prodDowntimeSchema.index({subdivision: 1, startedAt: -1});
  prodDowntimeSchema.index({mrpController: 1, startedAt: -1});
  prodDowntimeSchema.index({prodFlow: 1, startedAt: -1});
  prodDowntimeSchema.index({workCenter: 1, startedAt: -1});
  prodDowntimeSchema.index({prodLine: 1, startedAt: -1});

  prodDowntimeSchema.statics.TOPIC_PREFIX = 'prodDowntimes';

  mongoose.model('ProdDowntime', prodDowntimeSchema);
};
