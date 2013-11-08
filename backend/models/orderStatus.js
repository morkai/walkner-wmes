'use strict';

module.exports = function setupOrderStatusModel(app, mongoose)
{
  var orderStatusSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
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

  mongoose.model('OrderStatus', orderStatusSchema);
};
