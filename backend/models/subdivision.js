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
      enum: ['assembly', 'press', 'storage'],
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
    }
  }, {
    id: false
  });

  subdivisionSchema.statics.TOPIC_PREFIX = 'subdivisions';
  subdivisionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Subdivision', subdivisionSchema);
};
