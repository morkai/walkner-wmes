// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
