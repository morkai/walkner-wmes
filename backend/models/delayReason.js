// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupDelayReasonModel(app, mongoose)
{
  var delayReasonSchema = mongoose.Schema({
    name: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  delayReasonSchema.statics.TOPIC_PREFIX = 'delayReasons';
  delayReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DelayReason', delayReasonSchema);
};
