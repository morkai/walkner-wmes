// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupQiErrorCategoryModel(app, mongoose)
{
  var qiErrorCategorySchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    }
  }, {
    id: false
  });

  qiErrorCategorySchema.statics.TOPIC_PREFIX = 'qi.errorCategories';
  qiErrorCategorySchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('QiErrorCategory', qiErrorCategorySchema);
};
