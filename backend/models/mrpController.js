'use strict';

module.exports = function setupMrpControllerModel(app, mongoose)
{
  var mrpControllerSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    subdivision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subdivision',
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  mrpControllerSchema.statics.TOPIC_PREFIX = 'mrpControllers';
  mrpControllerSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('MrpController', mrpControllerSchema);
};
