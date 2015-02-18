// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      ref: 'XiconfOrder'
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
    }
  }, {
    id: false
  });

  xiconfResultSchema.index({nc12: 1, startedAt: -1});
  xiconfResultSchema.index({orderNo: 1, startedAt: -1});
  xiconfResultSchema.index({srcId: 1, startedAt: -1});
  xiconfResultSchema.index({startedAt: -1});

  mongoose.model('XiconfResult', xiconfResultSchema);
};
