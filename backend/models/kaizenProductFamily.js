// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKaizenProductFamilyModel(app, mongoose)
{
  var kaizenProductFamilySchema = mongoose.Schema({
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
    owners: [{}]
  }, {
    id: false
  });

  kaizenProductFamilySchema.statics.TOPIC_PREFIX = 'kaizen.productFamilies';
  kaizenProductFamilySchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('KaizenProductFamily', kaizenProductFamilySchema);
};
