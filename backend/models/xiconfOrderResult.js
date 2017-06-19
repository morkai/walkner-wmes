// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfOrderResultModel(app, mongoose)
{
  const xiconfOrderResultSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    no: String,
    quantity: Number,
    successCounter: Number,
    failureCounter: Number,
    startedAt: Date,
    finishedAt: Date,
    duration: Number,
    srcIp: String,
    srcId: String,
    srcTitle: String,
    srcUuid: String
  }, {
    id: false
  });

  xiconfOrderResultSchema.index({no: 1});
  xiconfOrderResultSchema.index({startedAt: -1});

  mongoose.model('XiconfOrderResult', xiconfOrderResultSchema);
};
