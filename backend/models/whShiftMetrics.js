// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupWhShiftMetricsModel(app, mongoose)
{
  var metric = {
    type: Number,
    default: 0
  };

  var whShiftMetricsSchema = mongoose.Schema({
    _id: {
      type: Date,
      required: true
    },
    tzOffsetMs: {
      type: Number,
      required: true
    },
    inCompCount: metric,
    inCompFte: metric,
    coopCompCount: metric,
    coopCompFte: metric,
    exStorageFte: metric,
    exStorageOutCount: metric,
    exStorageInCount: metric,
    fifoCount: metric,
    fifoFte: metric,
    stagingCount: metric,
    stagingFte: metric,
    smCount: metric,
    smFte: metric,
    paintCount: metric,
    paintFte: metric,
    fixBinCount: metric,
    fixBinFte: metric,
    finGoodsInCount: metric,
    finGoodsInFte: metric,
    finGoodsOutCount: metric,
    finGoodsOutFte: metric,
    compAbsenceFte: metric,
    finGoodsAbsenceFte: metric,
    compTotalFte: metric,
    finGoodsTotalFte: metric,
    compTasks: {
      type: {},
      default: {}
    },
    finGoodsTasks: {
      type: {},
      default: {}
    }
  }, {
    id: false,
    versionKey: false,
    minimize: false
  });

  mongoose.model('WhShiftMetrics', whShiftMetricsSchema);
};
