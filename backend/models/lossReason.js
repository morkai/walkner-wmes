// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupLossReasonModel(app, mongoose)
{
  var lossReasonSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    },
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  lossReasonSchema.statics.TOPIC_PREFIX = 'lossReasons';
  lossReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('LossReason', lossReasonSchema);
};
