// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWhOrderModel(app, mongoose)
{
  const FUNCS = ['fmx', 'kitter', 'packer'];

  const whOrderFuncSchema = new mongoose.Schema({
    _id: {
      type: String,
      enum: FUNCS
    },
    user: {},
    startedAt: Date,
    finishedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'picklist', 'pickup', 'problem', 'finished'],
      default: 'pending'
    },
    picklist: {
      type: String,
      enum: ['pending', 'require', 'ignore'],
      default: 'pending'
    },
    pickup: {
      type: String,
      enum: ['pending', 'success', 'failure'],
      default: 'pending'
    },
    carts: [String],
    problemArea: String,
    comment: String
  }, {
    minimize: false
  });

  const whOrderSchema = new mongoose.Schema({
    _id: String,
    status: {
      type: String,
      enum: ['pending', 'started', 'finished', 'problem', 'cancelled'],
      default: 'pending'
    },
    problem: String,
    order: String,
    group: Number,
    line: String,
    set: Number,
    startedAt: Date,
    finishedAt: Date,
    date: Date,
    qty: Number,
    startTime: Date,
    finishTime: Date,
    picklistFunc: {
      type: String,
      enum: FUNCS
    },
    picklistDone: {
      type: Boolean,
      default: false
    },
    funcs: [whOrderFuncSchema],
    users: [String]
  }, {
    id: false,
    minimize: false
  });

  whOrderSchema.statics.TOPIC_PREFIX = 'wh.orders';
  whOrderSchema.statics.BROWSE_LIMIT = 2000;
  whOrderSchema.statics.FUNCS = FUNCS;

  whOrderSchema.index({date: -1, line: 1});
  whOrderSchema.index({status: 1, date: -1});

  mongoose.model('WhOrder', whOrderSchema);
};
