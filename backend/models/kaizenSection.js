// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKaizenSectionModel(app, mongoose)
{
  var kaizenSectionSchema = mongoose.Schema({
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

  kaizenSectionSchema.statics.TOPIC_PREFIX = 'kaizen.sections';
  kaizenSectionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('KaizenSection', kaizenSectionSchema);
};
