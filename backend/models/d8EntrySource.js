// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setup8DEntrySourceModel(app, mongoose)
{
  var d8EntrySourceSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      match: /^[A-Za-z0-9-_]+$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  d8EntrySourceSchema.statics.TOPIC_PREFIX = 'd8.entrySources';
  d8EntrySourceSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('D8EntrySource', d8EntrySourceSchema);
};
