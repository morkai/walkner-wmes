// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function createOrderLossSchema(mongoose)
{
  return new mongoose.Schema({
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
