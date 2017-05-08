// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderDocumentUploadModel(app, mongoose)
{
  const orderDocumentUploadSchema = new mongoose.Schema({
    _id: String,
    nc15: String,
    count: Number
  }, {
    id: false
  });

  mongoose.model('OrderDocumentUpload', orderDocumentUploadSchema);
};
