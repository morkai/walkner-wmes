// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPaintShopDropZoneModel(app, mongoose)
{
  const paintShopDropZoneSchema = new mongoose.Schema({
    _id: {
      date: String,
      mrp: String
    },
    state: Boolean
  }, {
    id: false,
    minimize: false
  });

  paintShopDropZoneSchema.statics.TOPIC_PREFIX = 'paintShop.dropZones';

  paintShopDropZoneSchema.index({'_id.date': 1});

  mongoose.model('PaintShopDropZone', paintShopDropZoneSchema);
};
