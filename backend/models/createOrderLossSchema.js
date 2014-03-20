'use strict';

module.exports = function createOrderLossSchema(mongoose)
{
  return mongoose.Schema({
    reason: {
      type: String,
      ref: 'LossReason',
      required: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    count: {
      type: Number,
      required: true,
      min: 1
    }
  }, {
    _id: false
  });
};
