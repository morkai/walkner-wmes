// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderEtoModel(app, mongoose)
{
  const orderEtoSchema = new mongoose.Schema({
    _id: String,
    updatedAt: Date,
    constructor: String,
    html: String
  }, {
    id: false
  });

  orderEtoSchema.statics.TOPIC_PREFIX = 'orderDocuments.eto';
  orderEtoSchema.statics.BROWSE_LIMIT = 100;

  mongoose.model('OrderEto', orderEtoSchema);
};
