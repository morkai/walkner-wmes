// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfComponentWeightModel(app, mongoose)
{
  const xiconfComponentWeight = new mongoose.Schema({
    nc12: {
      type: String,
      required: true,
      match: /^[0-9]{12}$/
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    minWeight: {
      type: Number,
      required: true,
      min: 1
    },
    maxWeight: {
      type: Number,
      required: true,
      min: 1
    }
  }, {
    id: false,
    minimize: false
  });

  xiconfComponentWeight.index({nc12: 1});

  xiconfComponentWeight.statics.TOPIC_PREFIX = 'xiconfComponentWeights';

  mongoose.model('XiconfComponentWeight', xiconfComponentWeight);
};
