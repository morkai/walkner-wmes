// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfResultModel(app, mongoose)
{
  var xiconfResultSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: String,
      ref: 'XiconfOrderResult'
    },
    orderNo: String,
    nc12: String,
    counter: Number,
    startedAt: Date,
    finishedAt: Date,
    duration: Number,
    log: [],
    result: String,
    errorCode: String,
    exception: String,
    output: String,
    programName: String,
    featurePath: String,
    featureName: String,
    featureHash: String,
    workflowPath: String,
    workflow: String,
    srcIp: String,
    srcId: String,
    srcTitle: String,
    srcUuid: String,
    program: {
      type: Object,
      default: null
    },
    steps: {
      type: Object,
      default: null
    },
    metrics: {
      type: Object,
      default: null
    },
    serviceTag: {
      type: String,
      default: null
    },
    prodLine: {
      type: String,
      default: null
    },
    leds: [],
    gprsNc12: {
      type: String,
      default: null
    },
    gprsOrderFileHash: String,
    gprsInputFileHash: String,
    gprsOutputFileHash: String,
    cancelled: {
      type: Boolean,
      default: false
    }
  }, {
    id: false
  });

  xiconfResultSchema.index({orderNo: 1, serviceTag: 1, result: 1});
  xiconfResultSchema.index({nc12: 1});
  xiconfResultSchema.index({srcId: 1});
  xiconfResultSchema.index({serviceTag: 1});
  xiconfResultSchema.index({startedAt: -1});
  xiconfResultSchema.index({result: 1});

  mongoose.model('XiconfResult', xiconfResultSchema);
};
