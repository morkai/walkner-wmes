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
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    prodShift: {
      type: String,
      ref: 'ProdShift',
      required: true
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
      required: true
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
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    operationNo: {
      type: String,
      required: true
    }
  }, {
    id: false
  });

  prodDowntimeSchema.statics.TOPIC_PREFIX = 'prodDowntimes';

  mongoose.model('ProdDowntime', prodDowntimeSchema);
};
