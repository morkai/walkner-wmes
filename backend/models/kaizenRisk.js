// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKaizenRiskModel(app, mongoose)
{
  var kaizenRiskSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      match: /^[A-Za-z0-9-]+$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  kaizenRiskSchema.statics.TOPIC_PREFIX = 'kaizen.risks';
  kaizenRiskSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('KaizenRisk', kaizenRiskSchema);
};
