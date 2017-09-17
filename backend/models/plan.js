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
      item: String,
      name: String,
      machineSetupTime: Number,
      laborSetupTime: Number,
      machineTime: Number,
      laborTime: Number
    },
    manHours: Number,
    hardComponents: Boolean,
    quantityTodo: Number,
    quantityDone: Number,
    quantityPlan: Number,
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
    incomplete: Number,
    pceTime: Number,
    startAt: Date,
    finishAt: Date
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const autoDowntimeTimeSchema = new mongoose.Schema({
    d: Number,
    h: Number,
    m: Number
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const autoDowntimeSchema = new mongoose.Schema({
    reason: String,
    time: [autoDowntimeTimeSchema]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planLineSchema = new mongoose.Schema({
    _id: String,
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
