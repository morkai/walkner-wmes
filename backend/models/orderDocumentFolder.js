// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderDocumentFolderModel(app, mongoose)
{
  const orderDocumentFolderSchema = new mongoose.Schema({
    _id: String,
    name: String,
    parent: String,
    children: [String],
    oldParent: {
      type: String,
      default: null
    }
  }, {
    id: false
  });

  orderDocumentFolderSchema.statics.BROWSE_LIMIT = 0;

  orderDocumentFolderSchema.index({parent: 1});

  mongoose.model('OrderDocumentFolder', orderDocumentFolderSchema);
};
