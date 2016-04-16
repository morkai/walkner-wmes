// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupQiActionStatusModel(app, mongoose)
{
  var qiActionStatusSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      match: /^[A-Za-z0-9-]+$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  qiActionStatusSchema.statics.TOPIC_PREFIX = 'qi.actionStatuses';
  qiActionStatusSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('QiActionStatus', qiActionStatusSchema);
};
