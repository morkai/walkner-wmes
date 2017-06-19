// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPaintShopOrderModel(app, mongoose)
{
  const changeSchema = new mongoose.Schema({
    date: Date,
    user: {},
    data: {},
    comment: {
      type: String,
      trim: true,
      default: ''
    }
  }, {
    _id: false,
    minimize: false
  });

  const componentSchema = new mongoose.Schema({
    nc12: String,
    name: String,
    qty: Number
  }, {
    _id: false,
    minimize: false
  });

  const childOrderSchema = new mongoose.Schema({
    order: String,
    nc12: String,
    components: [componentSchema]
  }, {
    _id: false,
    minimize: false
  });

  const paintShopOrderSchema = new mongoose.Schema({
    _id: String,
    status: {
      type: String,
      enum: ['new', 'started', 'finished', 'cancelled'],
      default: 'new'
    },
    startedAt: Date,
    finishedAt: Date,
    changes: [changeSchema],
    date: Date,
    group: String,
    no: Number,
    followupNo: Number,
    followupId: String,
    order: String,
    qty: Number,
    mrp: String,
    paintType: String,
    placement: String,
    orders: [childOrderSchema]
  }, {
    id: false,
    minimize: false
  });

  paintShopOrderSchema.statics.TOPIC_PREFIX = 'paintShopOrders';

  paintShopOrderSchema.index({date: -1});
  paintShopOrderSchema.index({status: 1});

  mongoose.model('PaintShopOrder', paintShopOrderSchema);
};
