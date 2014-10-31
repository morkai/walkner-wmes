// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupVendorModel(app, mongoose)
{
  var vendorSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  vendorSchema.statics.TOPIC_PREFIX = 'vendors';

  mongoose.model('Vendor', vendorSchema);
};
