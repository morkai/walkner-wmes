// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderDocumentStatusModel(app, mongoose)
{
  var orderDocumentStatusModel = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    statusDate: {
      type: Number,
      required: true
    },
    files: [String]
  }, {
    id: false
  });

  mongoose.model('OrderDocumentStatus', orderDocumentStatusModel);
};
