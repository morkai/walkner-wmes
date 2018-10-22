// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupDelayReasonModel(app, mongoose)
{
  const delayReasonSchema = new mongoose.Schema({
    active: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    },
    drm: String
  }, {
    id: false
  });

  delayReasonSchema.statics.TOPIC_PREFIX = 'delayReasons';
  delayReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DelayReason', delayReasonSchema);
};
