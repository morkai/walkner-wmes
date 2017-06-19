// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupCagModel(app, mongoose)
{
  const cagSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true,
      pattern: /^[0-9]{6}$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  }, {
    id: false
  });

  cagSchema.statics.TOPIC_PREFIX = 'cags';
  cagSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Cag', cagSchema);
};
