'use strict';

module.exports = function setupWorkCenterModel(app, mongoose)
{
  var workCenterSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  workCenterSchema.statics.TOPIC_PREFIX = 'workCenters';

  mongoose.model('WorkCenter', workCenterSchema);
};
