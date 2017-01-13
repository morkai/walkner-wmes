// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupDailyMrpPlanModel(app, mongoose)
{
  const dailyMrpPlanOrderSchema = new mongoose.Schema({
    _id: String,
    nc12: String,
    name: String,
    qtyTodo: Number,
    qtyDone: Number,
    statuses: [String],
    operation: {}
  }, {
    id: false,
    minimize: false
  });

  const dailyMrpPlanLineOrderSchema = new mongoose.Schema({
    _id: String,
    orderNo: String,
    qty: Number,
    pceTime: Number,
    startAt: Date,
    finishAt: Date,
    incomplete: Number
  }, {
    id: false,
    minimize: false
  });

  const dailyMrpPlanLineSchema = new mongoose.Schema({
    _id: String,
    name: String,
    activeFrom: String,
    activeTo: String,
    workerCount: Number,
    hourlyPlan: [Number],
    pceTimes: [Number],
    totalQty: Number,
    orders: [dailyMrpPlanLineOrderSchema]
  }, {
    id: false,
    minimize: false
  });

  const dailyMrpPlanSchema = new mongoose.Schema({
    _id: String,
    updatedAt: Number,
    date: {
      type: Date,
      required: true
    },
    mrp: {
      type: String,
      required: true
    },
    orders: [dailyMrpPlanOrderSchema],
    lines: [dailyMrpPlanLineSchema]
  }, {
    id: false,
    minimize: false,
    versionKey: false
  });

  dailyMrpPlanSchema.index({date: -1, mrp: 1}, {unique: true});

  dailyMrpPlanSchema.statics.TOPIC_PREFIX = 'dailyMrpPlans';

  mongoose.model('DailyMrpPlan', dailyMrpPlanSchema);
};
