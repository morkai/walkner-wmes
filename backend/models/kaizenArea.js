// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKaizenAreaModel(app, mongoose)
{
  var kaizenAreaSchema = mongoose.Schema({
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
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  kaizenAreaSchema.statics.TOPIC_PREFIX = 'kaizen.areas';
  kaizenAreaSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('KaizenArea', kaizenAreaSchema);
};
