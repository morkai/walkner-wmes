// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfClientModel(app, mongoose)
{
  var xiconfClientSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    connectedAt: {
      type: Date,
      default: null
    },
    disconnectedAt: {
      type: Date,
      default: null
    },
    httpPort: {
      type: Number,
      default: 1337
    },
    socket: {
      type: String,
      default: null
    },
    prodLine: {
      type: String,
      ref: 'ProdLine',
      default: null
    },
    license: {
      type: String,
      ref: 'License',
      default: null
    },
    licenseError: {
      type: String,
      default: null
    },
    order: {
      type: String,
      ref: 'XiconfOrder',
      default: null
    },
    appVersion: {
      type: String,
      default: '0.0.0'
    },
    mowVersion: {
      type: String,
      default: '0.0.0.0'
    },
    coreScannerDriver: {
      type: Boolean,
      default: false
    },
    inputMode: {
      type: String,
      default: 'remote'
    }
  }, {
    id: false
  });

  xiconfClientSchema.statics.TOPIC_PREFIX = 'xiconf.clients';

  mongoose.model('XiconfClient', xiconfClientSchema);
};
