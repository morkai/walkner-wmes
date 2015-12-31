// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
