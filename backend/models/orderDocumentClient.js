// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderDocumentClientModel(app, mongoose)
{
  const orderDocumentClientSchema = new mongoose.Schema({
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
