// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupVendorNc12Model(app, mongoose)
{
  var vendorNc12Schema = mongoose.Schema({
    vendor: {
      type: String,
      ref: 'Vendor',
      required: true
    },
    nc12: {
      type: String,
      required: true
    },
    value: String,
    unit: String
  }, {
    id: false
  });

  vendorNc12Schema.statics.TOPIC_PREFIX = 'vendorNc12s';

  vendorNc12Schema.index({vendor: 1, nc12: 1}, {unique: true});

  mongoose.model('VendorNc12', vendorNc12Schema);
};
