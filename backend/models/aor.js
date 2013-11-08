'use strict';

module.exports = function setupAorModel(app, mongoose)
{
  var aorSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  aorSchema.statics.TOPIC_PREFIX = 'aors';

  mongoose.model('Aor', aorSchema);
};
