// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupLicensePingModel(app, mongoose)
{
  var licensePingSchema = mongoose.Schema({
    uuid: {
      type: String,
      ref: 'License',
      required: true
    },
    pingedAt: {
      type: Date,
      required: true
    },
    ip: {
      type: String,
      required: true
    },
    granted: {
      type: Boolean,
      required: true
    },
    meta: {}
  }, {
    id: false
  });

  licensePingSchema.statics.TOPIC_PREFIX = 'licensePings';

  licensePingSchema.index({uuid: 1, pingedAt: -1});

  mongoose.model('LicensePing', licensePingSchema);
};
