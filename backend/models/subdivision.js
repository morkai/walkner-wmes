// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupSubdivisionModel(app, mongoose)
{
  var subdivisionSchema = mongoose.Schema({
    division: {
      type: String,
      ref: 'Division',
      required: true
    },
    type: {
      type: String,
      enum: ['assembly', 'press', 'storage', 'other'],
      default: 'assembly'
    },
    name: {
      type: String,
      trim: true,
      required: true
    },
    prodTaskTags: [String],
    aor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aor',
      default: null
    },
    autoDowntime: {
      type: String,
      ref: 'DowntimeReason',
      default: null
    }
  }, {
    id: false
  });

  subdivisionSchema.statics.TOPIC_PREFIX = 'subdivisions';
  subdivisionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Subdivision', subdivisionSchema);
};
