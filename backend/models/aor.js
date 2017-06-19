// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupAorModel(app, mongoose)
{
  const aorSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      default: '#f08f44'
    },
    refColor: {
      type: String,
      default: '#ffa85c'
    },
    refValue: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  aorSchema.statics.TOPIC_PREFIX = 'aors';
  aorSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Aor', aorSchema);
};
