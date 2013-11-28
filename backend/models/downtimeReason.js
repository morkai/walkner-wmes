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
    }
  }, {
    id: false
  });

  downtimeReasonSchema.statics.TOPIC_PREFIX = 'downtimeReasons';
  downtimeReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DowntimeReason', downtimeReasonSchema);
};
