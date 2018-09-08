// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPkhdStrategyModel(app, mongoose)
{
  const pkhdStrategySchema = new mongoose.Schema({
    s: Number,
    t: Number,
    name: String
  }, {
    id: false
  });

  pkhdStrategySchema.statics.TOPIC_PREFIX = 'pkhdStrategies';

  pkhdStrategySchema.index({'s': 1, 't': 1}, {unique: true});

  mongoose.model('PkhdStrategy', pkhdStrategySchema);
};
