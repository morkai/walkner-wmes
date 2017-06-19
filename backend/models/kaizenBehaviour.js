// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKaizenBehaviourModel(app, mongoose)
{
  var kaizenBehaviourSchema = mongoose.Schema({
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

  kaizenBehaviourSchema.statics.TOPIC_PREFIX = 'kaizen.behaviours';
  kaizenBehaviourSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('KaizenBehaviour', kaizenBehaviourSchema);
};
