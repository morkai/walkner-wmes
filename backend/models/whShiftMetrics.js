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
    inComp: metric,
    coopCompCount: metric,
    coopCompFte: metric,
    coopComp: metric,
    exStorageFte: metric,
    exStorageOutCount: metric,
    exStorageOut: metric,
    exStorageInCount: metric,
    exStorageIn: metric,
    fifoCount: metric,
    fifoFte: metric,
    fifo: metric,
    stagingCount: metric,
    stagingFte: metric,
    staging: metric,
    smCount: metric,
    smFte: metric,
    sm: metric,
    paintCount: metric,
    paintFte: metric,
    paint: metric,
    fixBinCount: metric,
    fixBinFte: metric,
    fixBin: metric,
    finGoodsInCount: metric,
    finGoodsInFte: metric,
    finGoodsIn: metric,
    finGoodsOutCount: metric,
    finGoodsOutFte: metric,
    finGoodsOut: metric,
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
