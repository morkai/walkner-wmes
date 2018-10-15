// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupCounterModel(app, mongoose)
{
  const counterSchema = new mongoose.Schema({
    _id: {},
    t: Date,
    c: Number
  }, {
    id: false
  });

  counterSchema.statics.TOPIC_PREFIX = 'counters';

  mongoose.model('Counter', counterSchema);
};
