// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupDowntimeReasonModel(app, mongoose)
{
  var downtimeReasonSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
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
    },
    aors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aor'
    }],
    defaultAor: {
      type: Boolean,
      default: false
    }
  }, {
    id: false
  });

  downtimeReasonSchema.statics.TOPIC_PREFIX = 'downtimeReasons';
  downtimeReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DowntimeReason', downtimeReasonSchema);
};
