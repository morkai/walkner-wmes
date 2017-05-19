// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupVisNodePositionModel(app, mongoose)
{
  var visNodePositionSchema = new mongoose.Schema({
    _id: String,
    x: Number,
    y: Number
  }, {
    id: false
  });

  visNodePositionSchema.statics.TOPIC_PREFIX = 'vis.nodePositions';
  visNodePositionSchema.statics.BROWSE_LIMIT = Number.MAX_SAFE_INTEGER;

  mongoose.model('VisNodePosition', visNodePositionSchema);
};
