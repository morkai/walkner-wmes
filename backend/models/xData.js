// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXDataModel(app, mongoose)
{
  const xDataSchema = new mongoose.Schema({
    _id: String,
    createdAt: Date,
    title: String,
    data: {}
  }, {
    id: false,
    retainKeyOrder: true,
    minimize: false
  });

  xDataSchema.statics.TOPIC_PREFIX = 'sapLaborTimeFixer.xData';

  mongoose.model('XData', xDataSchema);
};
