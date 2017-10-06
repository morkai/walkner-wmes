// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPlanModel(app, mongoose)
{
  const planOrderSchema = new mongoose.Schema({
    _id: String,
    kind: {
      type: String,
      enum: ['unclassified', 'small', 'easy', 'hard']
    },
    mrp: String,
    nc12: String,
    name: String,
    statuses: [String],
    operation: {
      no: String,
      name: String,
      machineSetupTime: Number,
      laborSetupTime: Number,
      machineTime: Number,
      laborTime: Number
    },
    manHours: Number,
    hardComponent: String,
    quantityTodo: Number,
    quantityDone: Number,
    quantityPlan: Number,
    incomplete: Number,
    added: Boolean,
    ignored: Boolean
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planLineOrderSchema = new mongoose.Schema({
    _id: String,
    orderNo: String,
    quantity: Number,
    pceTime: Number,
    startAt: Date,
    finishAt: Date
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const autoDowntimeSchema = new mongoose.Schema({
    reason: String,
    startAt: Date,
    duration: Number
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planLineSchema = new mongoose.Schema({
    _id: String,
    version: Number,
    orders: [planLineOrderSchema],
    downtimes: [autoDowntimeSchema],
    totalQuantity: Number,
    hourlyPlan: [Number],
    pceTimes: [Number]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planSchema = new mongoose.Schema({
    _id: Date,
    createdAt: Date,
    updatedAt: Date,
    frozen: {
      type: Boolean,
      default: false
    },
    orders: [planOrderSchema],
    lines: [planLineSchema]
  }, {
    id: false,
    minimize: false,
    retainKeyOrder: true
  });

  planSchema.statics.TOPIC_PREFIX = 'planning.plans';

  planSchema.pre('save', function(next)
  {
    this.updatedAt = new Date();

    next();
  });

  mongoose.model('Plan', planSchema);
};
