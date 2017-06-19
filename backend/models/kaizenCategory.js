// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKaizenCategoryModel(app, mongoose)
{
  const kaizenCategorySchema = new mongoose.Schema({
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
    inNearMiss: {
      type: Boolean,
      required: true,
      default: false
    },
    inSuggestion: {
      type: Boolean,
      required: true,
      default: false
    },
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  kaizenCategorySchema.statics.TOPIC_PREFIX = 'kaizen.categories';
  kaizenCategorySchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('KaizenCategory', kaizenCategorySchema);
};
