// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWhControlCycleModel(app, mongoose)
{
  const whControlCycleSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    plant: {
      type: String,
      required: true
    },
    wh: {
      type: String,
      required: true
    },
    s: {
      type: Number,
      required: true
    }
  }, {
    id: false,
    versionKey: false
  });

  mongoose.model('WhControlCycle', whControlCycleSchema);
};
