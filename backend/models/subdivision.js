// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupSubdivisionModel(app, mongoose)
{
  var autoDowntimeTimeSchema = mongoose.Schema({
    h: {
      type: Number,
      min: 0,
      max: 23
    },
    m: {
      type: Number,
      min: 0,
      max: 59
    }
  }, {
    _id: false
  });

  var autoDowntimeSchema = mongoose.Schema({
    reason: {
      type: String,
      ref: 'DowntimeReason',
      required: true
    },
    when: {
      type: String,
      enum: ['initial', 'always', 'time'],
      default: 'always'
    },
    time: [autoDowntimeTimeSchema]
  }, {
    _id: false
  });

  var subdivisionSchema = mongoose.Schema({
    division: {
      type: String,
      ref: 'Division',
      required: true
    },
    type: {
      type: String,
      enum: [
        'assembly',
        'press',
        'storage',
        'paintShop',
        'other'
      ],
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
    autoDowntimes: [autoDowntimeSchema]
  }, {
    id: false
  });

  subdivisionSchema.statics.TOPIC_PREFIX = 'subdivisions';
  subdivisionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Subdivision', subdivisionSchema);
};
