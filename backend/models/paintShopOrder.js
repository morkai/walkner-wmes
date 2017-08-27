// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPaintShopOrderModel(app, mongoose)
{
  const componentSchema = new mongoose.Schema({
    nc12: String,
    name: String,
    qty: Number,
    unit: String
  }, {
    _id: false,
    minimize: false
  });

  const childOrderSchema = new mongoose.Schema({
    order: String,
    nc12: String,
    name: String,
    qty: Number,
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
    comment: String,
    date: Date,
    group: String,
    no: Number,
    followupNo: Number,
    followupId: String,
    order: String,
    nc12: String,
    name: String,
    qty: Number,
    mrp: String,
    paintType: String,
    placement: String,
    orders: [childOrderSchema]
  }, {
    id: false,
    minimize: false
  });

  paintShopOrderSchema.statics.TOPIC_PREFIX = 'paintShop.orders';
  paintShopOrderSchema.statics.BROWSE_LIMIT = 0;

  paintShopOrderSchema.index({date: -1});
  paintShopOrderSchema.index({status: 1});

  paintShopOrderSchema.methods.act = function(action, comment, done)
  {
    const changes = {
      _id: this._id
    };

    if (typeof comment === 'string' && comment.length)
    {
      changes.comment = comment;
    }

    switch (action)
    {
      case 'start':
        changes.status = 'started';
        changes.startedAt = new Date();
        changes.finishedAt = null;
        break;

      case 'finish':
        changes.status = 'finished';
        changes.finishedAt = new Date();
        break;

      case 'reset':
        changes.status = 'new';
        changes.startedAt = null;
        changes.finishedAt = null;
        break;

      case 'cancel':
        changes.status = 'cancelled';
        changes.startedAt = null;
        changes.finishedAt = null;
        break;

      case 'comment':
        break;

      default:
        return setImmediate(done, null, changes);
    }

    this.set(changes).save(err => done(err, changes));
  };

  mongoose.model('PaintShopOrder', paintShopOrderSchema);
};
