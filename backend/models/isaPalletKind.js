// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupIsaPalletKindModel(app, mongoose)
{
  var isaPalletKind = mongoose.Schema({
    shortName: {
      type: String,
      required: true,
      trim: true
    },
    fullName: {
      type: String,
      required: false,
      trim: true
    }
  }, {
    id: false
  });

  isaPalletKind.statics.TOPIC_PREFIX = 'isaPalletKinds';
  isaPalletKind.statics.BROWSE_LIMIT = 1000;

  mongoose.model('IsaPalletKind', isaPalletKind);
};
