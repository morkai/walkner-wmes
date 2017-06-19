// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderDocumentNameModel(app, mongoose)
{
  const orderDocumentNameModel = new mongoose.Schema({
    _id: String,
    name: String
  }, {
    id: false
  });

  mongoose.model('OrderDocumentName', orderDocumentNameModel);
};
