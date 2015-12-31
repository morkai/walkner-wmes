// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWorkCenterModel(app, mongoose)
{
  var workCenterSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
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
    },
    deactivatedAt: {
      type: Date,
      default: null
    }
  }, {
    id: false
  });

  workCenterSchema.statics.TOPIC_PREFIX = 'workCenters';
  workCenterSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('WorkCenter', workCenterSchema);
};
