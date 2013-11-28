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
    mrpController: {
      type: String,
      ref: 'MrpController',
      default: null
    },
    prodFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProdFlow',
      default: null
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
