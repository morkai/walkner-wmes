// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupMrpControllerModel(app, mongoose)
{
  const mrpControllerSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
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
    },
    deactivatedAt: {
      type: Date,
      default: null
    },
    replacedBy: {
      type: String,
      default: null
    },
    inout: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  mrpControllerSchema.statics.TOPIC_PREFIX = 'mrpControllers';
  mrpControllerSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('MrpController', mrpControllerSchema);
};
