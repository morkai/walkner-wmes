// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupD8AreaModel(app, mongoose)
{
  const d8AreaSchema = new mongoose.Schema({
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
    },
    manager: {}
  }, {
    id: false
  });

  d8AreaSchema.statics.TOPIC_PREFIX = 'd8.areas';
  d8AreaSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('D8Area', d8AreaSchema);
};
