'use strict';

module.exports = function setupDowntimeReasonModel(app, mongoose)
{
  var downtimeReasonSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    },
    pressPosition: {
      type: Number,
      default: -1
    },
    opticsPosition: {
      type: Number,
      default: -1
    },
    report1: {
      type: Boolean,
      default: true
    },
    auto: {
      type: Boolean,
      default: false
    }
  }, {
    id: false
  });

  downtimeReasonSchema.statics.TOPIC_PREFIX = 'downtimeReasons';
  downtimeReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DowntimeReason', downtimeReasonSchema);
};
