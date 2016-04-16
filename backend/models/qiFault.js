// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupQiFaultModel(app, mongoose)
{
  var qiFaultSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      match: /^[A-Za-z0-9-]+$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  }, {
    id: false
  });

  qiFaultSchema.statics.TOPIC_PREFIX = 'qi.faults';
  qiFaultSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('QiFault', qiFaultSchema);
};
