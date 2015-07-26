// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOrderDocumentClientModel(app, mongoose)
{
  var orderDocumentClientSchema = mongoose.Schema({
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
    socket: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    prodLine: {
      type: String,
      ref: 'ProdLine',
      default: null
    },
    settings: {},
    orderInfo: {}
  }, {
    id: false
  });

  orderDocumentClientSchema.statics.TOPIC_PREFIX = 'orderDocuments.clients';

  mongoose.model('OrderDocumentClient', orderDocumentClientSchema);
};
