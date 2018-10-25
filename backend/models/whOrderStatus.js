// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWhOrderStatusModel(app, mongoose)
{
  const whOrderStatusSchema = new mongoose.Schema({
    _id: {
      date: Date,
      line: String,
      orderNo: String,
      groupNo: Number
    },
    updatedAt: Date,
    updater: {},
    status: Number,
    qtySent: Number,
    pceTime: Number
  }, {
    id: false,
    minimize: false
  });

  whOrderStatusSchema.statics.TOPIC_PREFIX = 'planning.whOrderStatuses';
  whOrderStatusSchema.statics.BROWSE_LIMIT = 1500;

  whOrderStatusSchema.index({'_id.date': -1, '_id.line': 1, '_id.orderNo': 1});

  mongoose.model('WhOrderStatus', whOrderStatusSchema);
};
