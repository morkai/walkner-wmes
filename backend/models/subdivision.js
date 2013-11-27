'use strict';

module.exports = function setupSubdivisionModel(app, mongoose)
{
  var subdivisionSchema = mongoose.Schema({
    division: {
      type: String,
      ref: 'Division',
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    }
  }, {
    id: false
  });

  subdivisionSchema.statics.TOPIC_PREFIX = 'subdivisions';

  mongoose.model('Subdivision', subdivisionSchema);
};
