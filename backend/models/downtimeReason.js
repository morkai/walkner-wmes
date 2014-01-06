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
    }
  }, {
    id: false
  });

  downtimeReasonSchema.statics.TOPIC_PREFIX = 'downtimeReasons';
  downtimeReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DowntimeReason', downtimeReasonSchema);
};
