// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupDailyMrpPlanModel(app, mongoose)
{
  const dailyMrpPlanOrderSchema = new mongoose.Schema({
    _id: String,
    nc12: String,
    name: String,
    rbh: Number,
    qtyPlan: Number,
    qtyTodo: Number,
    qtyDone: Number,
    ignored: Boolean,
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

  const autoDowntimeTimeSchema = new mongoose.Schema({
    d: Number,
    h: Number,
    m: Number
  }, {
    _id: false,
    minimize: false
  });

  const autoDowntimeSchema = new mongoose.Schema({
    reason: String,
    time: [autoDowntimeTimeSchema]
  }, {
    _id: false,
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
    orders: [dailyMrpPlanLineOrderSchema],
    downtimes: [autoDowntimeSchema]
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
  dailyMrpPlanSchema.index({date: -1, 'lines._id': 1});
  dailyMrpPlanSchema.index({'orders._id': -1});

  dailyMrpPlanSchema.statics.TOPIC_PREFIX = 'dailyMrpPlans';

  mongoose.model('DailyMrpPlan', dailyMrpPlanSchema);
};
