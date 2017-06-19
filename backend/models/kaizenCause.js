// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKaizenCauseModel(app, mongoose)
{
  const kaizenCauseSchema = new mongoose.Schema({
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
    description: {
      type: String,
      trim: true,
      default: ''
    },
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  kaizenCauseSchema.statics.TOPIC_PREFIX = 'kaizen.causes';
  kaizenCauseSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('KaizenCause', kaizenCauseSchema);
};
