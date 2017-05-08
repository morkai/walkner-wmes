// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderDocumentFileModel(app, mongoose)
{
  const orderDocumentFileFileSchema = new mongoose.Schema({
    hash: String,
    type: String,
    date: Date
  }, {
    _id: false
  });

  const orderDocumentFileSchema = new mongoose.Schema({
    _id: String,
    name: String,
    folders: [String],
    files: [orderDocumentFileFileSchema],
    oldFolders: {
      type: [String],
      default: null
    }
  }, {
    id: false
  });

  orderDocumentFileSchema.statics.BROWSE_LIMIT = 0;

  orderDocumentFileSchema.index({folders: 1});

  mongoose.model('OrderDocumentFile', orderDocumentFileSchema);
};
