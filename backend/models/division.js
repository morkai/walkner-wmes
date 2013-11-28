'use strict';

module.exports = function setupDivisionModel(app, mongoose)
{
  var divisionSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  divisionSchema.statics.TOPIC_PREFIX = 'divisions';
  divisionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Division', divisionSchema);
};
