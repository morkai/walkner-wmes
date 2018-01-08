// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPaintShopPaintModel(app, mongoose)
{
  const paintShopPaintSchema = new mongoose.Schema({
    _id: String,
    shelf: String,
    bin: String,
    name: String
  }, {
    id: false,
    minimize: false
  });

  paintShopPaintSchema.statics.TOPIC_PREFIX = 'paintShop.paints';
  paintShopPaintSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('PaintShopPaint', paintShopPaintSchema);
};
