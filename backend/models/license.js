// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupLicenseModel(app, mongoose)
{
  var licenseSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
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
      max: 0xFFFF
    },
    key: {
      type: String,
      required: true,
      trim: true
    },
    expireDate: {
      type: Date,
      default: null
    }
  }, {
    id: false
  });

  licenseSchema.statics.TOPIC_PREFIX = 'licenses';

  mongoose.model('License', licenseSchema);
};
