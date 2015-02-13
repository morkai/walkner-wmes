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
    coopComp541Count: metric,
    coopComp344Count: metric,
    coopComp343Count: metric,
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

  whShiftMetricsSchema.methods.resetCounts = function()
  {
    this.set({
      inCompCount: 0,
      coopComp541Count: 0,
      coopComp344Count: 0,
      coopComp343Count: 0,
      exStorageOutCount: 0,
      exStorageInCount: 0,
      fifoCount: 0,
      stagingCount: 0,
      smCount: 0,
      paintCount: 0,
      fixBinCount: 0,
      finGoodsInCount: 0,
      finGoodsOutCount: 0
    });
  };

  whShiftMetricsSchema.methods.resetFte = function(resetComp, resetFinGoods)
  {
    if (resetComp !== false)
    {
      this.set({
        inCompFte: 0,
        coopCompFte: 0,
        exStorageFte: 0,
        fifoFte: 0,
        stagingFte: 0,
        smFte: 0,
        paintFte: 0,
        fixBinFte: 0,
        compAbsenceFte: 0,
        compTotalFte: 0,
        compTasks: {}
      });
    }

    if (resetFinGoods !== false)
    {
      this.set({
        finGoodsInFte: 0,
        finGoodsOutFte: 0,
        finGoodsAbsenceFte: 0,
        finGoodsTotalFte: 0,
        finGoodsTasks: {}
      });
    }
  };

  mongoose.model('WhShiftMetrics', whShiftMetricsSchema);
};
