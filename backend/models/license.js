// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupLicenseModel(app, mongoose)
{
  var licenseSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    appId: {
      type: String,
      required: true,
      trim: true
    },
    appVersion: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    licensee: {
      type: String,
      required: true,
      trim: true
    },
    features: {
      type: Number,
      default: 0,
      min: 0,
      max: 999
    },
    key: {
      type: String,
      required: true,
      trim: true
    }
  }, {
    id: false
  });

  licenseSchema.statics.TOPIC_PREFIX = 'licenses';

  mongoose.model('License', licenseSchema);
};
