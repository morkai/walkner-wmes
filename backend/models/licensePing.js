// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
