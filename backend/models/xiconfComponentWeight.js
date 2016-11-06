// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfComponentWeightModel(app, mongoose)
{
  const xiconfComponentWeight = new mongoose.Schema({
    _id: String,
    description: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      required: true,
      min: 1
    }
  }, {
    id: false,
    minimize: false
  });

  xiconfComponentWeight.index({products: 1});

  xiconfComponentWeight.statics.TOPIC_PREFIX = 'xiconfComponentWeights';

  mongoose.model('XiconfComponentWeight', xiconfComponentWeight);
};
