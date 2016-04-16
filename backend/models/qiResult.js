// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var autoIncrement = require('mongoose-auto-increment');

module.exports = function setupQiResultModel(app, mongoose)
{
  var qiCorrectiveActionSchema = new mongoose.Schema({
    what: {
      type: String,
      required: true
    },
    when: {
      type: Date,
      default: null
    },
    who: {},
    status: {
      type: String,
      ref: 'QiActionStatus',
      required: true
    }
  });

  var qiResultSchema = new mongoose.Schema({
    ok: {
      type: Boolean,
      required: true
    },
    creator: {},
    createdAt: Date,
    updater: {},
    updatedAt: Date,
    inspector: {},
    inspectedAt: {
      type: Date,
      required: true
    },
    division: {
      type: String,
      required: true
    },
    orderNo: {
      type: String,
      required: true
    },
    nc12: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productFamily: {
      type: String,
      required: true
    },
    kind: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'QiKind'
    },
    faultCode: {
      type: String,
      ref: 'QiFault'
    },
    faultDescription: String,
    errorCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QiErrorCategory'
    },
    problem: String,
    immediateActions: String,
    immediateResults: String,
    rootCause: String,
    correctiveActions: [qiCorrectiveActionSchema],
    qtyInspected: {
      type: Number,
      default: 0,
      min: 0
    },
    qtyToFix: {
      type: Number,
      default: 0,
      min: 0
    },
    qtyNok: {
      type: Number,
      default: 0,
      min: 0
    },
    okFile: {
      type: {},
      default: null
    },
    nokFile: {
      type: {},
      default: null
    }
  }, {
    id: false,
    minimize: false
  });

  qiResultSchema.plugin(autoIncrement.plugin, {
    model: 'QiResult',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  qiResultSchema.statics.TOPIC_PREFIX = 'qi.results';

  qiResultSchema.index({'inspector.id': 1});
  qiResultSchema.index({inspectedAt: -1});
  qiResultSchema.index({division: 1});
  qiResultSchema.index({orderNo: 1});
  qiResultSchema.index({nc12: 1});
  qiResultSchema.index({productFamily: 1});
  qiResultSchema.index({kind: 1});
  qiResultSchema.index({faultCode: 1});
  qiResultSchema.index({errorCategory: 1});

  qiResultSchema.pre('save', function(next)
  {
    if (this.isNew)
    {
      this.createdAt = new Date();
      this.updatedAt = this.createdAt;
    }
    else
    {
      this.updatedAt = new Date();
    }

    next();
  });

  mongoose.model('QiResult', qiResultSchema);
};
