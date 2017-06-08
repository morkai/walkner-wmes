// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupInvalidOrderModel(app, mongoose)
{
  const invalidOrderSchema = new mongoose.Schema({
    _id: String,
    updatedAt: Date,
    updater: {},
    mrp: String,
    status: {
      type: String,
      enum: ['invalid', 'ignored', 'resolved']
    },
    problem: String,
    solution: String,
    iptStatus: String,
    iptComment: String
  }, {
    id: false
  });

  invalidOrderSchema.statics.TOPIC_PREFIX = 'orders.invalid';

  invalidOrderSchema.index({status: 1});
  invalidOrderSchema.index({mrp: 1});
  invalidOrderSchema.index({updatedAt: -1});

  mongoose.model('InvalidOrder', invalidOrderSchema);
};
