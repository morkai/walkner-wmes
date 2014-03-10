'use strict';

module.exports = function setupFeedbackModel(app, mongoose)
{
  var feedbackSchema = mongoose.Schema({
    createdAt: {
      type: Date,
      required: true
    },
    creator: {},
    savedAt: {
      type: Date,
      required: true
    },
    page: {},
    versions: {},
    navigator: {},
    comment: {
      type: String,
      required: true,
      trim: true
    }
  }, {
    id: false
  });

  feedbackSchema.statics.TOPIC_PREFIX = 'feedback';

  mongoose.model('Feedback', feedbackSchema);
};
