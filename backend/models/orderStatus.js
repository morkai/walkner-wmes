// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderStatusModel(app, mongoose)
{
  const orderStatusSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true,
      default: '#999999'
    }
  }, {
    id: false
  });

  orderStatusSchema.statics.TOPIC_PREFIX = 'orderStatuses';
  orderStatusSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('OrderStatus', orderStatusSchema);
};
