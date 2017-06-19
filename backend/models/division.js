// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupDivisionModel(app, mongoose)
{
  const divisionSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['prod', 'dist', 'other'],
      default: 'prod'
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

  divisionSchema.statics.TOPIC_PREFIX = 'divisions';
  divisionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Division', divisionSchema);
};
