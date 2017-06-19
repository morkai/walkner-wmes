// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
