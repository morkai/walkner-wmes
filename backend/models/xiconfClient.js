// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
