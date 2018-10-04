// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupQiKindModel(app, mongoose)
{
  const qiKindSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    division: {
      type: String,
      ref: 'Division',
      default: null
    },
    order: {
      type: Boolean,
      default: true
    }
  }, {
    id: false
  });

  qiKindSchema.statics.TOPIC_PREFIX = 'qi.kinds';
  qiKindSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('QiKind', qiKindSchema);
};
