// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupHeffLineStateModel(app, mongoose)
{
  const heffLineStateSchema = new mongoose.Schema({
    _id: String,
    plan: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  heffLineStateSchema.statics.TOPIC_PREFIX = 'heffLineStates';
  heffLineStateSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('HeffLineState', heffLineStateSchema);
};
