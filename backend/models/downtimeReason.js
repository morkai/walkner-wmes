// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupDowntimeReasonModel(app, mongoose)
{
  var downtimeReasonSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    label: {
      type: String,
      trim: true,
      required: true
    },
    type: {
      type: String,
      enum: [
        'maintenance',
        'renovation',
        'malfunction',
        'adjusting',
        'break',
        'otherWorks',
        'other'
      ],
      required: true
    },
    subdivisionTypes: [{
      type: String,
      enum: ['assembly', 'press'],
      required: true
    }],
    pressPosition: {
      type: Number,
      default: -1
    },
    opticsPosition: {
      type: Number,
      default: -1
    },
    auto: {
      type: Boolean,
      default: false
    },
    scheduled: {
      type: Boolean,
      default: null
    },
    color: {
      type: String,
      default: '#ff0000'
    },
    refColor: {
      type: String,
      default: '#cc0000'
    },
    refValue: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  downtimeReasonSchema.statics.TOPIC_PREFIX = 'downtimeReasons';
  downtimeReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DowntimeReason', downtimeReasonSchema);
};
