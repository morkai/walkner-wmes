// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupClipOrderCacheModel(app, mongoose)
{
  const clipOrderCacheSchema = new mongoose.Schema({
    _id: {
      hash: {
        type: String,
        required: true,
        trim: true
      },
      no: {
        type: String,
        required: true
      }
    },
    expireAt: Date,
    name: String,
    nc12: String,
    mrp: String,
    qty: Number,
    startDate: Number,
    finishDate: Number,
    scheduledStartDate: Number,
    scheduledFinishDate: Number,
    delayReason: String,
    m4: String,
    drm: String,
    eto: Boolean,
    statuses: [String],
    productionTime: Number,
    productionStatus: String,
    endToEndTime: Number,
    endToEndStatus: String,
    comment: String
  }, {
    id: false,
    minimize: false,
    strict: false
  });

  clipOrderCacheSchema.index({'_id.hash': 1, '_id.startDate': 1});
  clipOrderCacheSchema.index({expireAt: 1}, {expireAfterSeconds: 0});

  mongoose.model('ClipOrderCache', clipOrderCacheSchema);
};
